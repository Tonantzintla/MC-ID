import { base } from "$api/base";
import { authMiddleware } from "$api/middlewares/auth";
import { MinecraftUUIDSchema } from "$api/schemas";
import { logger } from "$api/utils";
import { resolve } from "$app/paths";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";

const PluginCodeParams = z
  .object({
    userId: MinecraftUUIDSchema
  })
  .meta({
    title: "Plugin Code Path Parameters",
    description: "Path parameters for plugin code retrieval",
    examples: [{ userId: "069a79f444e94726a5befca90e38aaf5" }]
  });

const PluginCodeOutput = z
  .object({
    code: z.string().nullable().describe("6-digit verification code formatted with space (e.g., '123 456'), or null if no active code")
  })
  .meta({
    title: "Plugin Code Output",
    description: "Response schema for plugin code retrieval",
    examples: [{ code: "123 456" }, { code: null }]
  });

const description = `
Retrieve the latest active verification code for a Minecraft player to display in-game.

Authorization:
- API key must have the \`read\` permission for the \`plugin\` scope.

Usage Example:
When a player joins the server, the plugin calls this endpoint to check if they have an active verification code to display.

> [!warning] This internal endpoint is intended for the Minecraft server plugin only.  
> If you're not self-hosting MC-ID, you have no use for this endpoint.
  `;

export const getCode = base
  .use(authMiddleware({ plugin: ["read"] }))
  .errors({
    NOT_FOUND: { status: 404, error: "Not Found" },
    INTERNAL_ERROR: { status: 500, error: "Internal Server Error" }
  })
  .route({
    description,
    method: "GET",
    path: "/plugin/code/{userId}",
    summary: "Retrieve authentication code for Minecraft player",
    tags: ["Plugin"],
    successDescription: "Returns the latest active verification code or null if none exists",
    operationId: "getPluginCode"
  })
  .input(PluginCodeParams)
  .output(PluginCodeOutput)
  .handler(async ({ input, errors, context }) => {
    const startTime = Date.now();
    const { db } = context;
    const resolved = resolve("/api/[...rest]", { rest: `v1/plugin/code/${input.userId}` });

    try {
      logger.apiRequest(`/plugin/code/${input.userId}`, "GET", { userId: input.userId });

      // Check if user exists
      const user = await db.query.mcuser.findFirst({
        where: (u) => eq(u.id, input.userId)
      });

      if (!user) {
        logger.info("Plugin code request for non-existent user", { userId: input.userId });
        throw errors.NOT_FOUND();
      }

      // Find active verification code
      const codeRecord = await db.query.verificationCodes.findFirst({
        where: (vc) => and(eq(vc.mcuserId, user.id), gte(vc.expiration, new Date())),
        with: {
          apiKey: {
            columns: {
              name: true
            }
          }
        },
        orderBy: (vc) => [desc(vc.createdAt)]
      });

      const duration = Date.now() - startTime;

      if (codeRecord) {
        logger.apiResponse(resolved, "GET", 200, duration, {
          userId: input.userId,
          hasCode: true,
          appName: codeRecord.apiKey?.name
        });

        return {
          code: codeRecord.code
        };
      } else {
        logger.apiResponse(resolved, "GET", 200, duration, {
          userId: input.userId,
          hasCode: false
        });

        return {
          code: null
        };
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      logger.apiError(resolved, "GET", err, {
        userId: input.userId,
        duration
      });

      if (err instanceof ORPCError) {
        throw err;
      }

      throw errors.INTERNAL_ERROR({
        message: "Plugin code retrieval failed",
        cause: err
      });
    }
  });

import { base } from "$api/base";
import { authMiddleware } from "$api/middlewares/auth";
import { MinecraftUUIDSchema } from "$api/schemas";
import { defaultPermissions, getUsernameFromMcid, logger } from "$api/utils";
import { resolve } from "$app/paths";
import { mcuser, verificationCodes } from "$lib/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

const RequestCodeInput = z
  .object({
    uuid: MinecraftUUIDSchema
  })
  .meta({
    title: "Request Code Input",
    description: "Request body for generating a new verification code",
    example: [
      {
        uuid: "069a79f444e94726a5befca90e38aaf5"
      }
    ]
  });

const RequestCodeOutput = z
  .object({
    message: z.literal("Successfully generated the code.").describe("Success confirmation message"),
    userId: MinecraftUUIDSchema,
    expiresAt: z.iso.datetime().optional().describe("ISO 8601 timestamp when the code expires")
  })
  .meta({
    title: "Request Code Response",
    description: "Successful code generation response",
    examples: [
      {
        message: "Successfully generated the code.",
        userId: "069a79f444e94726a5befca90e38aaf5",
        expiresAt: "2025-10-02T12:05:00Z"
      }
    ]
  });

const description = `
Generate a new 6-digit verification code for a Minecraft player to authenticate with your application.

> [!note] Important Notes:  
> - Only one active code per app-user combination is allowed
> - Previous codes are automatically replaced
> - Codes expire after 5 minutes
`;

export const requestCode = base
  .use(authMiddleware(defaultPermissions))
  .errors({
    MINECRAFT_USER_NOT_FOUND: { status: 404, error: "Minecraft User Not Found" },
    MOJANG_API_ERROR: { status: 502, error: "Mojang API Error" },
    INTERNAL_ERROR: { status: 500, error: "Internal Server Error" }
  })
  .route({
    description,
    method: "POST",
    path: "/codes/request",
    summary: "Request authentication code for application",
    tags: ["Codes"],
    successDescription: "Verification code generated successfully",
    operationId: "requestCode"
  })
  .input(RequestCodeInput)
  .output(RequestCodeOutput)
  .handler(async ({ input, errors, context }) => {
    const startTime = Date.now();
    const { db } = context;
    const resolved = resolve("/api/[...rest]", { rest: "v1/codes/request" });
    try {
      logger.apiRequest(resolved, "POST", { uuid: input.uuid });

      const apiKey = context.apiKeyData;

      // Check if the Minecraft user exists
      const username = await getUsernameFromMcid(input.uuid);
      if (!username) {
        logger.error("User UUID no longer valid in Mojang API", null, { uuid: input.uuid });
        throw errors.MINECRAFT_USER_NOT_FOUND();
      }

      // Find or create MC user
      const [user] = await db
        .insert(mcuser)
        .values({ id: input.uuid })
        .onConflictDoUpdate({
          target: mcuser.id,
          set: { id: input.uuid }
        })
        .returning();

      if (!user) {
        throw errors.INTERNAL_ERROR({
          message: `Failed to find or create user with ID: ${input.uuid}`
        });
      }

      // Generate verification code
      const expiration = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes

      // Store the code (upsert)
      await db
        .insert(verificationCodes)
        .values({
          appApiKeyId: apiKey.id,
          mcuserId: user.id,
          expiration
        })
        .onConflictDoUpdate({
          target: [verificationCodes.appApiKeyId, verificationCodes.mcuserId],
          set: {
            code: null,
            expiration
          }
        });

      const duration = Date.now() - startTime;
      logger.apiResponse(resolved, "POST", 200, duration, {
        uuid: input.uuid,
        username
      });

      return {
        message: "Successfully generated the code.",
        userId: user.id,
        expiresAt: expiration.toISOString()
      };
    } catch (err) {
      const duration = Date.now() - startTime;
      logger.apiError(resolved, "POST", err, { uuid: input.uuid, duration });

      if (err instanceof ORPCError) {
        throw err;
      }

      throw errors.INTERNAL_ERROR({
        message: "Code request failed",
        cause: err
      });
    }
  });

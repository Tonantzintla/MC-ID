import { CommonResponses, PluginCodeOutput, PluginCodeParams } from "$api/schemas";
import { CommonErrors, createAPIError, createError, createHandleUnexpectedError, ErrorTypes, logger, requireApiKey } from "$api/utils";
import { resolve } from "$app/paths";
import { getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import { and, desc, eq, gte } from "drizzle-orm";
import { Endpoint, type RouteModifier } from "sveltekit-api";

export const Modifier: RouteModifier = (c) => {
  c.summary = "Retrieve authentication code for Minecraft player";
  c.description = `
Retrieve the latest active verification code for a Minecraft player to display in-game.

Authorization:
- API key must have the \`read\` permission for the \`plugin\` scope.

Usage Example:
When a player joins the server, the plugin calls this endpoint to check if they have an active verification code to display.

> [!warning] This internal endpoint is intended for the Minecraft server plugin only.  
> If you're not self-hosting MC-ID, you have no use for this endpoint.
  `;
  c.tags = ["Plugin"];
  c.responses = {
    200: {
      description: "Plugin code retrieval successful",
      content: {
        "application/json": {
          schema: PluginCodeOutput,
          examples: {
            activeCode: {
              summary: "Active Code",
              value: { code: "123 456" },
              description: "An active verification code is available for the user"
            },
            noActiveCode: {
              summary: "No Active Code",
              value: { code: null },
              description: "No active verification code exists for the user"
            }
          }
        }
      }
    },
    ...c.responses,
    ...CommonResponses
  };
  return c;
};

export const Param = PluginCodeParams;
export const Output = PluginCodeOutput;

export const Errors = {
  ...CommonErrors,
  [ErrorTypes.NOT_FOUND.statusCode]: createAPIError(createError.notFound("User not found"))
};

export default new Endpoint({ Param, Output, Modifier, Error: Errors }).handle(async (param) => {
  const startTime = Date.now();
  const resolved = resolve("/api/v1/plugin/code/[userId]", { userId: param.userId });

  try {
    logger.apiRequest(`/plugin/code/${param.userId}`, "GET", { userId: param.userId });

    // Validate API key
    const { request } = getRequestEvent();
    const { headers } = request;
    const xApiKey = headers.get("x-api-key");

    const { key: _apiKey } = await requireApiKey(xApiKey, {
      plugin: ["read"]
    });

    // Check if user exists
    const user = await db.query.mcuser.findFirst({
      where: (u) => eq(u.id, param.userId)
    });

    if (!user) {
      logger.info("Plugin code request for non-existent user", { userId: param.userId });
      throw Errors[ErrorTypes.NOT_FOUND.statusCode];
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
        userId: param.userId,
        hasCode: true,
        appName: codeRecord.apiKey?.name
      });

      return {
        code: codeRecord.code
      };
    } else {
      logger.apiResponse(resolved, "GET", 200, duration, {
        userId: param.userId,
        hasCode: false
      });

      return {
        code: null
      };
    }
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.apiError(resolved, "GET", err, {
      userId: param.userId,
      duration
    });

    if (err instanceof Error && err.name === "APIError") {
      throw err;
    }

    throw createHandleUnexpectedError(err, "Plugin code retrieval failed");
  }
});

import { CommonResponses, PluginCodeOutput, PluginCodeParams } from "$api/schemas";
import { createError, handleUnexpectedError, logger, throwAPIError } from "$api/utils";
import { getRequestEvent } from "$app/server";
import { env } from "$env/dynamic/private";
import { db } from "$lib/server/db";
import { and, desc, eq, gte } from "drizzle-orm";
import { Endpoint, type RouteModifier } from "sveltekit-api";

const { PLUGIN_KEY } = env;

export const Modifier: RouteModifier = (c) => {
  c.summary = "Retrieve authentication code for Minecraft player";
  c.description = `
Retrieve the latest active verification code for a Minecraft player to display in-game.

Authorization:
- Requires plugin authentication via Bearer token
- Plugin key must match the configured PLUGIN_KEY environment variable

Usage Example:
When a player joins the server, the plugin calls this endpoint to check if they have an active verification code to display.

> [!warning] This internal endpoint is intended for the Minecraft server plugin only.  
> If you're not self-hosting MC-ID, you have no use for this endpoint.
  `;
  c.tags = ["Plugin"];
  c.security = [{ BearerAuth: [] }];
  c.responses = {
    200: {
      description: "Active verification code found",
      content: {
        "application/json": {
          schema: PluginCodeOutput,
          example: {
            code: "123 456"
          }
        }
      }
    },
    401: CommonResponses[401],
    404: CommonResponses[404],
    500: CommonResponses[500]
  };
  return c;
};

export const Param = PluginCodeParams;
export const Output = PluginCodeOutput;

export default new Endpoint({ Param, Output, Modifier }).handle(async (param) => {
  const startTime = Date.now();

  try {
    const { request, getClientAddress } = getRequestEvent();
    const clientIP = getClientAddress() || "unknown";

    logger.apiRequest(`/plugin/code/${param.userId}`, "GET", { userId: param.userId, ip: clientIP });

    // Validate plugin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Plugin authentication failed - missing auth header", { userId: param.userId, ip: clientIP });
      throw throwAPIError(createError.unauthorized("Authorization header missing or invalid"));
    }

    const token = authHeader.split(" ")[1];
    if (!token || token !== PLUGIN_KEY) {
      logger.warn("Plugin authentication failed - invalid token", { userId: param.userId, ip: clientIP });
      throw throwAPIError(createError.unauthorized("Invalid plugin key"));
    }

    // Check if user exists
    const user = await db.query.mcuser.findFirst({
      where: (u) => eq(u.id, param.userId)
    });

    if (!user) {
      logger.info("Plugin code request for non-existent user", { userId: param.userId, ip: clientIP });
      throw throwAPIError(createError.notFound("User not found"));
    }

    // Find active verification code
    const codeRecord = await db.query.verificationCodes.findFirst({
      where: (vc) => and(eq(vc.mcuserId, user.id), gte(vc.expiration, new Date())),
      with: { app: true },
      orderBy: (vc) => [desc(vc.createdAt)]
    });

    const duration = Date.now() - startTime;

    if (codeRecord) {
      logger.apiResponse(`/plugin/code/${param.userId}`, "GET", 200, duration, {
        userId: param.userId,
        hasCode: true,
        appName: codeRecord.app?.name,
        ip: clientIP
      });

      return {
        code: codeRecord.code
      };
    } else {
      logger.apiResponse(`/plugin/code/${param.userId}`, "GET", 200, duration, {
        userId: param.userId,
        hasCode: false,
        ip: clientIP
      });

      return {
        code: null
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError(`/plugin/code/${param.userId}`, "GET", error, {
      userId: param.userId,
      duration
    });

    if (error instanceof Error && error.name === "APIError") {
      throw error;
    }

    throw handleUnexpectedError(error, "Plugin code retrieval failed");
  }
});

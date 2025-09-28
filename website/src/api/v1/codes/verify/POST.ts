import { CommonResponses, VerifyCodeInput, VerifyCodeOutput } from "$api/schemas";
import { CommonCodeErrors, CommonErrors, createAPIError, createError, createHandleUnexpectedError, defaultPermissions, ErrorTypes, getUsernameFromMcid, logger, requireApiKey } from "$api/utils";
import { resolve } from "$app/paths";
import { getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import { verificationCodes } from "$lib/server/db/schema";
import { and, desc, eq, gte } from "drizzle-orm";
import { Endpoint, type RouteModifier } from "sveltekit-api";

export const Modifier: RouteModifier = (c) => {
  c.summary = "Verify authentication code for application";
  c.description = `
Verify a 6-digit verification code to authenticate a Minecraft player with your application.

> [!note] Important Notes:  
> - Codes are single-use and deleted after verification
> - Codes expire after 5 minutes
  `;
  c.tags = ["Codes"];
  c.responses = {
    201: {
      description: "Code verified successfully",
      content: {
        "application/json": {
          schema: VerifyCodeOutput,
          example: {
            id: "069a79f444e94726a5befca90e38aaf5",
            username: "Notch"
          }
        }
      }
    },
    ...Object.fromEntries(Object.entries(c.responses).filter(([status]) => status !== "200")),
    ...CommonResponses
  };
  return c;
};

export const Input = VerifyCodeInput;
export const Output = VerifyCodeOutput;

export const Errors = {
  ...CommonErrors,
  ...CommonCodeErrors,
  [ErrorTypes.CODE_EXPIRED.statusCode]: createAPIError(createError.codeExpired("Invalid or expired verification code")),
  [ErrorTypes.UNAUTHORIZED.statusCode]: createAPIError(createError.unauthorized("Code does not belong to the specified user")),
  [ErrorTypes.MINECRAFT_USER_NOT_FOUND.statusCode]: createAPIError(createError.minecraftUserNotFound())
};

export default new Endpoint({ Input, Output, Modifier, Error: Errors }).handle(async (body) => {
  const startTime = Date.now();
  const resolved = resolve("/api/v1/codes/verify");

  try {
    logger.apiRequest(resolved, "POST", {
      uuid: body.uuid,
      codeProvided: !!body.code
    });

    // Validate API key
    const { request } = getRequestEvent();
    const { headers } = request;
    const xApiKey = headers.get("x-api-key");

    const { key: apiKey } = await requireApiKey(xApiKey, defaultPermissions);

    // Find the verification code
    const codeRecord = await db.query.verificationCodes.findFirst({
      where: (vc) => and(eq(vc.code, body.code), eq(vc.appApiKeyId, apiKey.id), gte(vc.expiration, new Date())),
      with: { user: true },
      orderBy: (vc) => [desc(vc.createdAt)]
    });

    if (!codeRecord) {
      logger.warn("Code verification failed - code not found or expired", {
        uuid: body.uuid,
        code: body.code
      });
      throw Errors[ErrorTypes.CODE_EXPIRED.statusCode];
    }

    // Verify the user UUID matches
    if (codeRecord.user.id !== body.uuid) {
      logger.warn("Code verification failed - UUID mismatch", {
        expectedUuid: body.uuid,
        actualUuid: codeRecord.user.id,
        code: body.code
      });
      throw Errors[ErrorTypes.UNAUTHORIZED.statusCode];
    }

    // Delete the used code
    await db.delete(verificationCodes).where(eq(verificationCodes.code, body.code));

    // Get the current username from Mojang (in case it changed)
    const username = await getUsernameFromMcid(body.uuid);
    if (!username) {
      logger.error("User UUID no longer valid in Mojang API", null, { uuid: body.uuid });
      throw Errors[ErrorTypes.MINECRAFT_USER_NOT_FOUND.statusCode];
    }

    const duration = Date.now() - startTime;
    logger.apiResponse(resolved, "POST", 200, duration, {
      uuid: body.uuid,
      username,
      codeUsed: true
    });

    logger.userAction("code_verified", body.uuid, { username });

    return {
      id: codeRecord.user.id,
      username
    };
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.apiError(resolved, "POST", err, {
      uuid: body.uuid,
      duration
    });

    if (err instanceof Error && err.name === "APIError") {
      throw err;
    }

    throw createHandleUnexpectedError(err, "Code verification failed");
  }
});

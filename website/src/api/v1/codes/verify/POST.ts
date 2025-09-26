import { CommonResponses, VerifyCodeInput, VerifyCodeOutput } from "$api/schemas";
import { createError, getUsernameFromMcid, handleUnexpectedError, logger, requireAppAuth, throwAPIError } from "$api/utils";
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
    200: {
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
    400: CommonResponses[400],
    401: CommonResponses[401],
    403: CommonResponses[403],
    404: CommonResponses[404],
    410: CommonResponses[410],
    500: CommonResponses[500],
    502: CommonResponses[502]
  };
  return c;
};

export const Input = VerifyCodeInput;
export const Output = VerifyCodeOutput;

export default new Endpoint({ Input, Output, Modifier }).handle(async (body) => {
  const startTime = Date.now();

  try {
    logger.apiRequest("/codes/verify", "POST", {
      appId: body.appId,
      uuid: body.uuid,
      codeProvided: !!body.code
    });

    // Validate app credentials first
    const { clientId } = await requireAppAuth(body.appId, body.appSecret);

    // Find the verification code
    const codeRecord = await db.query.verificationCodes.findFirst({
      where: (vc) => and(eq(vc.code, body.code), eq(vc.appClientId, clientId), gte(vc.expiration, new Date())),
      with: { user: true },
      orderBy: (vc) => [desc(vc.createdAt)]
    });

    if (!codeRecord) {
      logger.warn("Code verification failed - code not found or expired", {
        appId: body.appId,
        uuid: body.uuid,
        code: body.code
      });
      throw throwAPIError(createError.codeExpired("Invalid or expired verification code"));
    }

    // Verify the user UUID matches
    if (codeRecord.user.id !== body.uuid) {
      logger.warn("Code verification failed - UUID mismatch", {
        appId: body.appId,
        expectedUuid: body.uuid,
        actualUuid: codeRecord.user.id,
        code: body.code
      });
      throw throwAPIError(createError.unauthorized("Code does not belong to the specified user"));
    }

    // Delete the used code
    await db.delete(verificationCodes).where(eq(verificationCodes.code, body.code));

    // Get the current username from Mojang (in case it changed)
    const username = await getUsernameFromMcid(body.uuid);
    if (!username) {
      logger.error("User UUID no longer valid in Mojang API", null, { uuid: body.uuid });
      throw throwAPIError(createError.minecraftUserNotFound(body.uuid));
    }

    const duration = Date.now() - startTime;
    logger.apiResponse("/codes/verify", "POST", 200, duration, {
      appId: body.appId,
      uuid: body.uuid,
      username,
      codeUsed: true
    });

    logger.userAction("code_verified", body.uuid, { appId: body.appId, username });

    return {
      id: codeRecord.user.id,
      username
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.apiError("/codes/verify", "POST", error, {
      appId: body.appId,
      uuid: body.uuid,
      duration
    });

    if (error instanceof Error && error.name === "APIError") {
      throw error;
    }

    throw handleUnexpectedError(error, "Code verification failed");
  }
});

import { base } from "$api/base";
import { authMiddleware } from "$api/middlewares/auth";
import { MinecraftUUIDSchema, VerificationCodeSchema } from "$api/schemas";
import { defaultPermissions, getUsernameFromMcid, logger } from "$api/utils";
import { resolve } from "$app/paths";
import { verificationCodes } from "$lib/server/db/schema";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";

const VerifyCodeInput = z
  .object({
    code: VerificationCodeSchema,
    uuid: MinecraftUUIDSchema
  })
  .meta({
    title: "Verify Code Input",
    description: "Request body for verifying an authentication code",
    examples: [
      {
        code: "123456",
        uuid: "069a79f444e94726a5befca90e38aaf5"
      }
    ]
  });

const VerifyCodeOutput = z
  .object({
    userId: MinecraftUUIDSchema.describe("Minecraft player UUID (32-character hex string)"),
    username: z.string().min(1).max(16).describe("Current Minecraft username from Mojang API")
  })
  .meta({
    title: "Verify Code Response",
    description: "Successful code verification response with player information",
    examples: [
      {
        userId: "069a79f444e94726a5befca90e38aaf5",
        username: "Notch"
      }
    ]
  });

const description = `
Verify a 6-digit verification code to authenticate a Minecraft player with your application.

> [!note] Important Notes:  
> - Codes are single-use and deleted after verification
> - Codes expire after 5 minutes
  `;

export const verifyCode = base
  .use(authMiddleware(defaultPermissions))
  .errors({
    CODE_EXPIRED: { status: 410, error: "Code Expired" },
    MINECRAFT_USER_NOT_FOUND: { status: 404, error: "Minecraft User Not Found" },
    MOJANG_API_ERROR: { status: 502, error: "Mojang API Error" },
    FORBIDDEN: { status: 403, error: "Forbidden" },
    INTERNAL_ERROR: { status: 500, error: "Internal Server Error" }
  })
  .route({
    description,
    method: "POST",
    path: "/codes/verify",
    summary: "Verify authentication code for application",
    tags: ["Codes"],
    successDescription: "Code verified successfully",
    operationId: "verifyCode"
  })
  .input(VerifyCodeInput)
  .output(VerifyCodeOutput)
  .handler(async ({ input, errors, context }) => {
    const startTime = Date.now();
    const { db } = context;
    const resolved = resolve("/api/[...rest]", { rest: "v1/codes/verify" });

    try {
      logger.apiRequest(resolved, "POST", {
        uuid: input.uuid,
        codeProvided: !!input.code
      });

      const apiKey = context.apiKeyData;

      // Find the verification code
      const codeRecord = await db.query.verificationCodes.findFirst({
        where: (vc) => and(eq(vc.code, input.code), eq(vc.appApiKeyId, apiKey.id), gte(vc.expiration, new Date())),
        with: { user: true },
        orderBy: (vc) => [desc(vc.createdAt)]
      });

      if (!codeRecord) {
        logger.warn("Code verification failed - code not found or expired", {
          uuid: input.uuid,
          code: input.code
        });
        throw errors.CODE_EXPIRED();
      }

      // Verify the user UUID matches
      if (codeRecord.user.id !== input.uuid) {
        logger.warn("Code verification failed - UUID mismatch", {
          expectedUuid: input.uuid,
          actualUuid: codeRecord.user.id,
          code: input.code
        });
        throw errors.FORBIDDEN({
          message: "The provided code belongs to a different user",
          data: {
            reason: "UUID mismatch"
          }
        });
      }

      // Delete the used code
      await db.delete(verificationCodes).where(eq(verificationCodes.code, input.code));

      // Get the current username from Mojang (in case it changed)
      const username = await getUsernameFromMcid(input.uuid);
      if (!username) {
        logger.error("User UUID no longer valid in Mojang API", null, { uuid: input.uuid });
        throw errors.MINECRAFT_USER_NOT_FOUND();
      }

      const duration = Date.now() - startTime;
      logger.apiResponse(resolved, "POST", 200, duration, {
        uuid: input.uuid,
        username,
        codeUsed: true
      });

      logger.userAction("code_verified", input.uuid, { username });

      return {
        userId: codeRecord.user.id,
        username
      };
    } catch (err) {
      const duration = Date.now() - startTime;
      logger.apiError(resolved, "POST", err, {
        uuid: input.uuid,
        duration
      });

      if (err instanceof ORPCError) {
        throw err;
      }

      throw errors.INTERNAL_ERROR({
        message: "Code verification failed",
        cause: err
      });
    }
  });

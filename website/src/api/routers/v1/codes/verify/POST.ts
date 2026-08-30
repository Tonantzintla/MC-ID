import { base } from "$api/base";
import { authMiddleware } from "$api/middlewares/auth";
import { MinecraftUUIDSchema, VerificationCodeSchema } from "$api/schemas";
import { defaultPermissions, getUsernameFromMcid, logger } from "$api/utils";
import { resolve } from "$app/paths";
import { verificationCodes } from "$lib/shared/db/schema";
import { ORPCError } from "@orpc/server";
import { and, eq, gte } from "drizzle-orm";
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

      // Atomically claim this exact, unexpired code. DELETE ... RETURNING ensures
      // concurrent verification attempts cannot both accept the same code.
      const [codeRecord] = await db
        .delete(verificationCodes)
        .where(
          and(
            eq(verificationCodes.code, input.code),
            eq(verificationCodes.appApiKeyId, apiKey.id),
            eq(verificationCodes.mcuserId, input.uuid),
            gte(verificationCodes.expiration, new Date())
          )
        )
        .returning({ id: verificationCodes.id, userId: verificationCodes.mcuserId });

      if (!codeRecord) {
        logger.warn("Code verification failed - code not found or expired", {
          uuid: input.uuid,
          codeProvided: true
        });
        throw errors.CODE_EXPIRED();
      }

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
        userId: codeRecord.userId,
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

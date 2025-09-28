import { z } from "zod";
import { MinecraftUUIDSchema, VerificationCodeSchema } from "./common";

// /api/v1/codes/request - POST
export const RequestCodeInput = z
  .object({
    uuid: MinecraftUUIDSchema
  })
  .openapi({
    title: "Request Code Input",
    description: "Request body for generating a new verification code",
    example: {
      uuid: "069a79f444e94726a5befca90e38aaf5"
    }
  });

export const RequestCodeOutput = z.object({
  message: z.literal("Successfully generated the code.").describe("Success confirmation message"),
  userId: MinecraftUUIDSchema.describe("The Minecraft player's UUID (same as input)")
});

// /api/v1/codes/verify - POST
export const VerifyCodeInput = z
  .object({
    code: VerificationCodeSchema,
    uuid: MinecraftUUIDSchema
  })
  .openapi({
    title: "Verify Code Input",
    description: "Request body for verifying an authentication code",
    example: {
      code: "123456",
      uuid: "069a79f444e94726a5befca90e38aaf5"
    }
  });

export const VerifyCodeOutput = z.object({
  id: MinecraftUUIDSchema.describe("Minecraft player UUID (32-character hex string)"),
  username: z.string().min(1).max(16).describe("Current Minecraft username from Mojang API")
});

// /api/v1/plugin/code/[userId] - GET
export const PluginCodeParams = z
  .object({
    userId: MinecraftUUIDSchema
  })
  .openapi({
    title: "Plugin Code Path Parameters",
    description: "Path parameters for plugin code retrieval",
    example: { userId: "069a79f444e94726a5befca90e38aaf5" }
  });

export const PluginCodeOutput = z.object({
  code: z.string().nullable().describe("6-digit verification code formatted with space (e.g., '123 456'), or null if no active code")
});

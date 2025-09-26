import { z } from "zod";
import { AppCredentialsSchema, MinecraftUUIDSchema, VerificationCodeSchema } from "./common";

// /api/v1/codes/request - POST
export const RequestCodeInput = AppCredentialsSchema.extend({
  uuid: MinecraftUUIDSchema
}).openapi({
  title: "Request Code Input",
  description: "Request body for generating a new verification code",
  example: {
    appId: "app_clxyz123456789abcdef",
    appSecret: "secret_abc123def456ghi789jkl012mno345pqr678stu",
    uuid: "069a79f444e94726a5befca90e38aaf5"
  }
});

export const RequestCodeOutput = z
  .object({
    message: z.literal("Successfully generated the code.").describe("Success confirmation message"),
    userId: MinecraftUUIDSchema.describe("The Minecraft player's UUID (same as input)")
  })
  .openapi({
    title: "Request Code Response",
    description: "Successful response when a verification code is generated",
    example: {
      message: "Successfully generated the code.",
      userId: "069a79f444e94726a5befca90e38aaf5"
    }
  });

// /api/v1/codes/verify - POST
export const VerifyCodeInput = AppCredentialsSchema.extend({
  code: VerificationCodeSchema,
  uuid: MinecraftUUIDSchema
}).openapi({
  title: "Verify Code Input",
  description: "Request body for verifying an authentication code",
  example: {
    appId: "app_clxyz123456789abcdef",
    appSecret: "secret_abc123def456ghi789jkl012mno345pqr678stu",
    code: "123456",
    uuid: "069a79f444e94726a5befca90e38aaf5"
  }
});

export const VerifyCodeOutput = z
  .object({
    id: MinecraftUUIDSchema.describe("Minecraft player UUID (32-character hex string)"),
    username: z.string().min(1).max(16).describe("Current Minecraft username from Mojang API")
  })
  .openapi({
    title: "Verify Code Response",
    description: "Successful response when a verification code is verified",
    example: {
      id: "069a79f444e94726a5befca90e38aaf5",
      username: "Notch"
    }
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

export const PluginCodeOutput = z
  .object({
    code: z.string().nullable().describe("6-digit verification code formatted with space (e.g., '123 456'), or null if no active code"),
    appName: z.string().nullable().describe("Name of the application that requested the code, or null if no active code")
  })
  .openapi({
    title: "Plugin Code Response",
    description: "Plugin code retrieval response with formatted code and app info",
    examples: [
      {
        summary: "Active code exists",
        value: {
          code: "123 456"
        }
      },
      {
        summary: "No active code",
        value: {
          code: null
        }
      }
    ]
  });

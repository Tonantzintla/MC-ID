import { z } from "zod";

export const MinecraftUUIDSchema = z
  .string()
  .length(32, "UUID must be exactly 32 characters")
  .regex(/^[0-9a-f]{32}$/, "UUID must contain only lowercase hexadecimal characters")
  .describe("Minecraft player UUID without dashes (32 hex characters)")
  .openapi({
    title: "Minecraft UUID",
    description: "Unique identifier for a Minecraft player",
    example: "069a79f444e94726a5befca90e38aaf5"
  });

export const VerificationCodeSchema = z
  .string()
  .length(6, "Code must be exactly 6 digits")
  .regex(/^\d{6}$/, "Code must contain only digits")
  .describe("6-digit verification code")
  .openapi({
    title: "Verification Code",
    description: "Numeric verification code displayed to the player",
    example: "123456"
  });

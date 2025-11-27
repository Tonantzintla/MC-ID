import { z } from "zod";

export const MinecraftUUIDStrictSchema = z
  .string()
  .length(32, "UUID must be exactly 32 characters")
  .regex(/^[0-9a-f]{32}$/, "UUID must contain only lowercase hexadecimal characters")
  .describe("32-character hexadecimal Minecraft player UUID (without hyphens)")
  .meta({
    title: "Minecraft UUID (Strict)",
    description: "Unique identifier for a Minecraft player (no hyphens allowed)",
    examples: ["069a79f444e94726a5befca90e38aaf5"]
  });

export const MinecraftUUIDSchema = z
  .preprocess((val) => (typeof val === "string" ? val.replace(/-/g, "") : val), z.string())
  .pipe(MinecraftUUIDStrictSchema)
  .describe("32-character hexadecimal Minecraft player UUID (without hyphens)")
  .meta({
    title: "Minecraft UUID",
    description: "Unique identifier for a Minecraft player",
    examples: ["069a79f444e94726a5befca90e38aaf5"]
  });

export const VerificationCodeSchema = z
  .string()
  .length(6, "Code must be exactly 6 digits")
  .regex(/^\d{6}$/, "Code must contain only digits")
  .describe("6-digit numeric verification code")
  .meta({
    title: "Verification Code",
    description: "Numeric verification code displayed to the player",
    examples: ["123456"]
  });

export const MinecraftUsernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(16, "Username must not exceed 16 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores")
  .describe("Valid Minecraft username (3-16 characters)")
  .meta({
    title: "Minecraft Username",
    description: "Minecraft player username",
    examples: ["Notch", "Dream", "Technoblade"]
  });

// Common error response schema
export const ApiErrorSchema = z
  .object({
    code: z.string().describe("Error code"),
    message: z.string().describe("Human-readable error message"),
    status: z.number().describe("HTTP status code"),
    data: z.unknown().optional().describe("Additional error context")
  })
  .meta({
    title: "API Error Response",
    description: "Standard error response format",
    examples: [
      {
        code: "UNAUTHORIZED",
        message: "No API key provided",
        status: 401,
        data: { reason: "Missing X-API-Key header" }
      }
    ]
  });

import { z } from "zod";

// Base error response schema used across all endpoints
export const BaseErrorResponse = z
  .object({
    error: z.string().describe("Error category (e.g., 'Bad Request', 'Unauthorized')"),
    message: z.string().describe("Human-readable error message"),
    statusCode: z.number().int().describe("HTTP status code"),
    timestamp: z.iso.datetime().optional().describe("ISO 8601 timestamp when the error occurred"),
    requestId: z.string().optional().describe("Unique request identifier for tracing"),
    details: z.record(z.string(), z.unknown()).optional().describe("Additional error details")
  })
  .openapi({
    title: "Error Response",
    description: "Standard error response format used across all endpoints"
  });

// Specific error types with examples
export const ValidationErrorResponse = BaseErrorResponse.extend({
  error: z.literal("Bad Request").describe("Indicates a client error in the request"),
  details: z
    .object({
      field: z.string().optional().describe("Field that failed validation"),
      issue: z.string().optional().describe("Description of the validation issue")
    })
    .optional()
}).openapi({
  title: "Validation Error",
  description: "Response when request validation fails",
  example: {
    error: "Bad Request",
    message: "Validation failed for uuid: Invalid Minecraft UUID format",
    statusCode: 400,
    timestamp: "2024-01-01T12:00:00.000Z",
    details: {
      field: "uuid",
      issue: "Invalid Minecraft UUID format"
    }
  }
});

export const UnauthorizedErrorResponse = BaseErrorResponse.extend({
  error: z.literal("Unauthorized").describe("Authentication is required"),
  message: z.string().describe("Specific reason for authentication failure")
}).openapi({
  title: "Authentication Error",
  description: "Response when authentication fails",
  example: {
    error: "Unauthorized",
    message: "Invalid application credentials",
    statusCode: 401,
    timestamp: "2024-01-01T12:00:00.000Z"
  }
});

export const ForbiddenErrorResponse = BaseErrorResponse.extend({
  error: z.literal("Forbidden").describe("Access is denied"),
  message: z.string().describe("Reason why access was denied")
}).openapi({
  title: "Authorization Error",
  description: "Response when access is denied",
  example: {
    error: "Forbidden",
    message: "Application has been disabled",
    statusCode: 403,
    timestamp: "2024-01-01T12:00:00.000Z"
  }
});

export const NotFoundErrorResponse = BaseErrorResponse.extend({
  error: z.literal("Not Found").describe("Requested resource does not exist"),
  message: z.string().describe("Description of what was not found")
}).openapi({
  title: "Resource Not Found",
  description: "Response when a requested resource cannot be found",
  example: {
    error: "Not Found",
    message: "Minecraft user with UUID abc123def456 not found",
    statusCode: 404,
    timestamp: "2024-01-01T12:00:00.000Z"
  }
});

export const ExpiredErrorResponse = BaseErrorResponse.extend({
  error: z.literal("Gone").describe("Resource has expired or is no longer available"),
  message: z.string().describe("Reason why the resource is no longer available")
}).openapi({
  title: "Resource Expired",
  description: "Response when a resource has expired",
  example: {
    error: "Gone",
    message: "Verification code has expired",
    statusCode: 410,
    timestamp: "2024-01-01T12:00:00.000Z"
  }
});

export const InternalErrorResponse = BaseErrorResponse.extend({
  error: z.literal("Internal Server Error").describe("Server encountered an unexpected error"),
  message: z.string().describe("Generic error message (sensitive details omitted)")
}).openapi({
  title: "Server Error",
  description: "Response when the server encounters an unexpected error",
  example: {
    error: "Internal Server Error",
    message: "An unexpected error occurred",
    statusCode: 500,
    timestamp: "2024-01-01T12:00:00.000Z"
  }
});

export const ServiceUnavailableErrorResponse = BaseErrorResponse.extend({
  error: z.literal("Service Unavailable").describe("Service is temporarily unavailable"),
  message: z.string().describe("Reason for unavailability")
}).openapi({
  title: "Service Unavailable",
  description: "Response when an external service is unavailable",
  example: {
    error: "Service Unavailable",
    message: "Mojang API is currently unavailable",
    statusCode: 503,
    timestamp: "2024-01-01T12:00:00.000Z"
  }
});

// Input validation schemas
export const AppCredentialsSchema = z
  .object({
    appId: z
      .string()
      .min(24, "App ID must be at least 24 characters")
      .max(30, "App ID must be at most 30 characters")
      .regex(/^[a-z0-9]+$/, "App ID must contain only lowercase letters and numbers")
      .describe("Application identifier (CUID2 format)"),
    appSecret: z.string().min(32, "App secret must be at least 32 characters").max(128, "App secret must be at most 128 characters").describe("Application secret for authentication")
  })
  .openapi({
    title: "App Credentials",
    description: "Authentication credentials for the application",
    example: {
      appId: "app_clxyz123456789abcdef",
      appSecret: "secret_abc123def456ghi789jkl012mno345pqr678stu"
    }
  });

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

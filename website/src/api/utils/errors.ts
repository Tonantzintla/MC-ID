import { error as svelteKitError } from "sveltekit-api";
import { logger } from "./logger";

// Standard error response format
export interface APIErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp?: string;
  requestId?: string;
  details?: Record<string, unknown>;
}

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "APIError";
  }
}

// Predefined error types
export const ErrorTypes = {
  // Client errors (4xx)
  VALIDATION_ERROR: { statusCode: 400, error: "Bad Request" },
  UNAUTHORIZED: { statusCode: 401, error: "Unauthorized" },
  FORBIDDEN: { statusCode: 403, error: "Forbidden" },
  NOT_FOUND: { statusCode: 404, error: "Not Found" },
  CONFLICT: { statusCode: 409, error: "Conflict" },
  RATE_LIMITED: { statusCode: 429, error: "Too Many Requests" },

  // Server errors (5xx)
  INTERNAL_ERROR: { statusCode: 500, error: "Internal Server Error" },
  SERVICE_UNAVAILABLE: { statusCode: 503, error: "Service Unavailable" },

  // Custom business logic errors
  INVALID_CREDENTIALS: { statusCode: 401, error: "Invalid Credentials" },
  MINECRAFT_USER_NOT_FOUND: { statusCode: 404, error: "Minecraft User Not Found" },
  CODE_EXPIRED: { statusCode: 410, error: "Code Expired" },
  CODE_ALREADY_USED: { statusCode: 410, error: "Code Already Used" },
  MOJANG_API_ERROR: { statusCode: 502, error: "External Service Error" }
} as const;

// Error factory functions
export const createError = {
  validation: (message: string, details?: Record<string, unknown>) => new APIError(ErrorTypes.VALIDATION_ERROR.statusCode, ErrorTypes.VALIDATION_ERROR.error, message, details),

  unauthorized: (message = "Authentication required") => new APIError(ErrorTypes.UNAUTHORIZED.statusCode, ErrorTypes.UNAUTHORIZED.error, message),

  forbidden: (message = "Access denied") => new APIError(ErrorTypes.FORBIDDEN.statusCode, ErrorTypes.FORBIDDEN.error, message),

  notFound: (message = "Resource not found") => new APIError(ErrorTypes.NOT_FOUND.statusCode, ErrorTypes.NOT_FOUND.error, message),

  internal: (message = "An unexpected error occurred") => new APIError(ErrorTypes.INTERNAL_ERROR.statusCode, ErrorTypes.INTERNAL_ERROR.error, message),

  invalidCredentials: (message = "Invalid application credentials") => new APIError(ErrorTypes.INVALID_CREDENTIALS.statusCode, ErrorTypes.INVALID_CREDENTIALS.error, message),

  minecraftUserNotFound: (uuid: string) => new APIError(ErrorTypes.MINECRAFT_USER_NOT_FOUND.statusCode, ErrorTypes.MINECRAFT_USER_NOT_FOUND.error, `Minecraft user with UUID ${uuid} not found`),

  codeExpired: (message = "Verification code has expired") => new APIError(ErrorTypes.CODE_EXPIRED.statusCode, ErrorTypes.CODE_EXPIRED.error, message),

  mojangApiError: (message = "Failed to communicate with Mojang API") => new APIError(ErrorTypes.MOJANG_API_ERROR.statusCode, ErrorTypes.MOJANG_API_ERROR.error, message)
};

// Convert APIError to SvelteKit error
export function throwAPIError(apiError: APIError): never {
  const errorResponse: APIErrorResponse = {
    error: apiError.error,
    message: apiError.message,
    statusCode: apiError.statusCode,
    timestamp: new Date().toISOString(),
    ...(apiError.details && { details: apiError.details })
  };

  logger.error("API Error thrown", apiError, {
    statusCode: apiError.statusCode,
    error: apiError.error
  });

  throw svelteKitError(apiError.statusCode, JSON.stringify(errorResponse));
}

// Handle unexpected errors
export function handleUnexpectedError(error: unknown, context?: string): never {
  const message = error instanceof Error ? error.message : "Unknown error occurred";
  const apiError = createError.internal(context ? `${context}: ${message}` : message);

  logger.error("Unexpected error", error, { context });

  throw throwAPIError(apiError);
}

// Validation error helper
export function throwValidationError(field: string, issue: string): never {
  const apiError = createError.validation(`Validation failed for ${field}: ${issue}`, { field, issue });
  throw throwAPIError(apiError);
}

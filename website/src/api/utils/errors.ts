import { error } from "sveltekit-api";
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
  INVALID_API_KEY: { statusCode: 401, error: "Invalid API Key" },
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

  invalidApiKey: (message = "Invalid API key") => new APIError(ErrorTypes.INVALID_API_KEY.statusCode, ErrorTypes.INVALID_API_KEY.error, message),

  minecraftUserNotFound: (message = "Minecraft user with given UUID not found") => new APIError(ErrorTypes.MINECRAFT_USER_NOT_FOUND.statusCode, ErrorTypes.MINECRAFT_USER_NOT_FOUND.error, message),

  codeExpired: (message = "Verification code has expired") => new APIError(ErrorTypes.CODE_EXPIRED.statusCode, ErrorTypes.CODE_EXPIRED.error, message),

  mojangApiError: (message = "Failed to communicate with Mojang API") => new APIError(ErrorTypes.MOJANG_API_ERROR.statusCode, ErrorTypes.MOJANG_API_ERROR.error, message)
};

export function createAPIError(apiError: APIError) {
  const errorResponse: APIErrorResponse = {
    error: apiError.error,
    message: apiError.message,
    statusCode: apiError.statusCode,
    timestamp: new Date().toISOString(),
    ...(apiError.details && { details: apiError.details })
  };

  logger.error("API Error thrown", apiError, {
    error: apiError.error,
    message: apiError.message,
    statusCode: apiError.statusCode,
    timestamp: errorResponse.timestamp,
    details: apiError.details
  });

  return error(apiError.statusCode, errorResponse.message);
}

// Handle unexpected errors with JSON response
export function createHandleUnexpectedError(error: unknown, context?: string) {
  const message = error instanceof Error ? error.message : "Unknown error occurred";
  const apiError = createError.internal(context ? `${context}: ${message}` : message);

  logger.error("Unexpected error", error, { context });

  return createAPIError(apiError);
}

// Validation error helper
export function createValidationError(field: string, issue: string) {
  const apiError = createError.validation(`Validation failed for ${field}: ${issue}`, { field, issue });
  throw createAPIError(apiError);
}

export const CommonErrors = {
  [ErrorTypes.VALIDATION_ERROR.statusCode]: createAPIError(createError.validation("X-API-Key header is required", { header: "X-API-Key" }))
};

export const CommonCodeErrors = {
  [ErrorTypes.MOJANG_API_ERROR.statusCode]: createAPIError(createError.mojangApiError("Mojang API returned an error"))
};

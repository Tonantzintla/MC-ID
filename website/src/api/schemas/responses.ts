import { z } from "zod";
import { ExpiredErrorResponse, ForbiddenErrorResponse, InternalErrorResponse, NotFoundErrorResponse, ServiceUnavailableErrorResponse, UnauthorizedErrorResponse, ValidationErrorResponse } from "./common";

// Common response definitions that can be reused across endpoints
export const CommonResponses = {
  400: {
    description: "Bad Request - Invalid input data",
    content: {
      "application/json": {
        schema: ValidationErrorResponse,
        examples: {
          invalidUuid: {
            summary: "Invalid UUID format",
            value: {
              error: "Bad Request",
              message: "Validation failed for uuid: Invalid Minecraft UUID format",
              statusCode: 400,
              timestamp: "2024-01-01T12:00:00.000Z",
              details: { field: "uuid", issue: "Must be 32 hexadecimal characters" }
            }
          },
          invalidAppId: {
            summary: "Invalid App ID format",
            value: {
              error: "Bad Request",
              message: "Validation failed for appId: App ID must be a valid CUID2",
              statusCode: 400,
              timestamp: "2024-01-01T12:00:00.000Z",
              details: { field: "appId", issue: "Must be 24-30 characters long" }
            }
          }
        }
      }
    }
  },

  401: {
    description: "Unauthorized - Authentication failed",
    content: {
      "application/json": {
        schema: UnauthorizedErrorResponse,
        examples: {
          invalidCredentials: {
            summary: "Invalid app credentials",
            value: {
              error: "Unauthorized",
              message: "Invalid application credentials",
              statusCode: 401,
              timestamp: "2024-01-01T12:00:00.000Z"
            }
          },
          missingAuth: {
            summary: "Missing authentication",
            value: {
              error: "Unauthorized",
              message: "App ID and App Secret are required",
              statusCode: 401,
              timestamp: "2024-01-01T12:00:00.000Z"
            }
          },
          invalidPluginKey: {
            summary: "Invalid plugin key",
            value: {
              error: "Unauthorized",
              message: "Invalid plugin key",
              statusCode: 401,
              timestamp: "2024-01-01T12:00:00.000Z"
            }
          }
        }
      }
    }
  },

  403: {
    description: "Forbidden - Access denied",
    content: {
      "application/json": {
        schema: ForbiddenErrorResponse,
        examples: {
          disabledApp: {
            summary: "Application disabled",
            value: {
              error: "Forbidden",
              message: "Application has been disabled",
              statusCode: 403,
              timestamp: "2024-01-01T12:00:00.000Z"
            }
          }
        }
      }
    }
  },

  404: {
    description: "Not Found - Resource does not exist",
    content: {
      "application/json": {
        schema: NotFoundErrorResponse,
        examples: {
          minecraftUserNotFound: {
            summary: "Minecraft user not found",
            value: {
              error: "Not Found",
              message: "Minecraft user with UUID 069a79f444e94726a5befca90e38aaf5 not found",
              statusCode: 404,
              timestamp: "2024-01-01T12:00:00.000Z"
            }
          },
          userNotFound: {
            summary: "User not found",
            value: {
              error: "Not Found",
              message: "User not found",
              statusCode: 404,
              timestamp: "2024-01-01T12:00:00.000Z"
            }
          }
        }
      }
    }
  },

  410: {
    description: "Gone - Resource has expired",
    content: {
      "application/json": {
        schema: ExpiredErrorResponse,
        examples: {
          expiredCode: {
            summary: "Verification code expired",
            value: {
              error: "Gone",
              message: "Verification code has expired",
              statusCode: 410,
              timestamp: "2024-01-01T12:00:00.000Z"
            }
          },
          invalidCode: {
            summary: "Invalid verification code",
            value: {
              error: "Gone",
              message: "Invalid or expired verification code",
              statusCode: 410,
              timestamp: "2024-01-01T12:00:00.000Z"
            }
          }
        }
      }
    }
  },

  500: {
    description: "Internal Server Error - Unexpected server error",
    content: {
      "application/json": {
        schema: InternalErrorResponse,
        examples: {
          generic: {
            summary: "Generic server error",
            value: {
              error: "Internal Server Error",
              message: "An unexpected error occurred",
              statusCode: 500,
              timestamp: "2024-01-01T12:00:00.000Z"
            }
          },
          databaseError: {
            summary: "Database error",
            value: {
              error: "Internal Server Error",
              message: "Database operation failed",
              statusCode: 500,
              timestamp: "2024-01-01T12:00:00.000Z"
            }
          }
        }
      }
    }
  },

  502: {
    description: "Bad Gateway - External service error",
    content: {
      "application/json": {
        schema: ServiceUnavailableErrorResponse.extend({
          error: z.literal("Bad Gateway"),
          statusCode: z.literal(502)
        }),
        examples: {
          mojangApiError: {
            summary: "Mojang API error",
            value: {
              error: "Bad Gateway",
              message: "Failed to communicate with Mojang API",
              statusCode: 502,
              timestamp: "2024-01-01T12:00:00.000Z"
            }
          }
        }
      }
    }
  },

  503: {
    description: "Service Unavailable - Service temporarily unavailable",
    content: {
      "application/json": {
        schema: ServiceUnavailableErrorResponse,
        examples: {
          serviceDown: {
            summary: "Service unavailable",
            value: {
              error: "Service Unavailable",
              message: "Service is temporarily unavailable",
              statusCode: 503,
              timestamp: "2024-01-01T12:00:00.000Z"
            }
          }
        }
      }
    }
  }
} as const;

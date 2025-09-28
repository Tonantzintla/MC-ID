import { dev } from "$app/environment";
import pino from "pino";

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogContext {
  userId?: string;
  apiKey?: string;
  endpoint?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  duration?: number;
  [key: string]: unknown;
}

class Logger {
  private pino: pino.Logger;

  constructor() {
    // Configure Pino logger
    this.pino = pino({
      level: dev ? "debug" : "info",
      transport: dev
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "hostname,pid",
              singleLine: false,
              errorLikeObjectKeys: ["err", "error", "stack"],
              messageFormat: "{msg}"
            }
          }
        : undefined,
      base: {
        env: dev ? "development" : "production"
      }
    });
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (error instanceof Error) {
      // Use Pino's built-in error handling for proper stack trace formatting
      this.pino.error({ ...context, err: error }, message);
    } else if (error) {
      this.pino.error({ ...context, error }, message);
    } else {
      this.pino.error(context || {}, message);
    }
  }

  warn(message: string, context?: LogContext): void {
    this.pino.warn(context || {}, message);
  }

  info(message: string, context?: LogContext): void {
    this.pino.info(context || {}, message);
  }

  debug(message: string, context?: LogContext): void {
    this.pino.debug(context || {}, message);
  }

  // Specific logging methods for API endpoints
  apiRequest(endpoint: string, method: string, context?: LogContext): void {
    this.pino.info({ ...context, endpoint, method, type: "api_request" }, `${method} ${endpoint} - Request started`);
  }

  apiResponse(endpoint: string, method: string, statusCode: number, duration: number, context?: LogContext): void {
    const logData = {
      ...context,
      endpoint,
      method,
      statusCode,
      duration,
      type: "api_response"
    };

    const message = `${method} ${endpoint} - Response ${statusCode}`;

    if (statusCode >= 400) {
      this.pino.error(logData, message);
    } else if (statusCode >= 300) {
      this.pino.warn(logData, message);
    } else {
      this.pino.info(logData, message);
    }
  }

  apiError(endpoint: string, method: string, error: Error | unknown, context?: LogContext): void {
    const logData = {
      ...context,
      endpoint,
      method,
      type: "api_error"
    };

    if (error instanceof Error) {
      // Use Pino's built-in error handling for proper stack trace formatting
      this.pino.error({ ...logData, err: error }, `${method} ${endpoint} - Error occurred`);
    } else if (error) {
      this.pino.error({ ...logData, error }, `${method} ${endpoint} - Error occurred`);
    } else {
      this.pino.error(logData, `${method} ${endpoint} - Error occurred`);
    }
  }

  authAttempt(success: boolean, identifier?: string, context?: LogContext): void {
    const message = success ? "Authentication successful" : "Authentication failed";
    const logData = {
      ...context,
      identifier,
      authSuccess: success,
      type: "auth_attempt"
    };

    if (success) {
      this.pino.info(logData, message);
    } else {
      this.pino.warn(logData, message);
    }
  }

  userAction(action: string, userId: string, context?: LogContext): void {
    this.pino.info(
      {
        ...context,
        userId,
        action,
        type: "user_action"
      },
      `User action: ${action}`
    );
  }
}

export const logger = new Logger();

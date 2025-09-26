import { dev } from "$app/environment";

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogContext {
  userId?: string;
  appId?: string;
  endpoint?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  duration?: number;
  [key: string]: unknown;
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    // In development, log everything. In production, log INFO and above
    this.logLevel = dev ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const errorDetails = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : { error };

    const fullContext = { ...context, ...errorDetails };
    console.error(this.formatMessage("ERROR", message, fullContext));
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    console.warn(this.formatMessage("WARN", message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    console.info(this.formatMessage("INFO", message, context));
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    console.debug(this.formatMessage("DEBUG", message, context));
  }

  // Specific logging methods for API endpoints
  apiRequest(endpoint: string, method: string, context?: LogContext): void {
    this.info(`${method} ${endpoint} - Request started`, context);
  }

  apiResponse(endpoint: string, method: string, statusCode: number, duration: number, context?: LogContext): void {
    const level = statusCode >= 400 ? "error" : statusCode >= 300 ? "warn" : "info";
    this[level](`${method} ${endpoint} - Response ${statusCode}`, {
      ...context,
      statusCode,
      duration
    });
  }

  apiError(endpoint: string, method: string, error: Error | unknown, context?: LogContext): void {
    this.error(`${method} ${endpoint} - Error occurred`, error, context);
  }

  authAttempt(success: boolean, appId?: string, context?: LogContext): void {
    const message = success ? "Authentication successful" : "Authentication failed";
    const level = success ? "info" : "warn";
    this[level](message, { ...context, appId, authSuccess: success });
  }

  userAction(action: string, userId: string, context?: LogContext): void {
    this.info(`User action: ${action}`, { ...context, userId, action });
  }
}

export const logger = new Logger();

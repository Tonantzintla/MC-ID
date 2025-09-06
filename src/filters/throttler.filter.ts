import { Catch, ArgumentsHost, Logger, ExceptionFilter } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';

@Catch(ThrottlerException)
export class ThrottlerFilter implements ExceptionFilter {
  private readonly logger = new Logger(ThrottlerFilter.name);

  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const request: Request = ctx.getRequest();
    const status = exception.getStatus();

    this.logger.warn(
      `Throttler exception caught: ${exception.message} on ${request.method} ${request.url} by ${request.ip}`,
    );

    response.status(status).json({
      statusCode: status,
      message: 'Too many requests. Please try again later.',
      timestamp: new Date().toISOString(),
    });
  }
}

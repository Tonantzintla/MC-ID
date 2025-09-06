import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const throttlingConfig = registerAs('throttling', () => ({
  appTTL: process.env.APP_TTL,
  appLimit: process.env.APP_LIMIT,
  globalTTL: process.env.GLOBAL_TTL,
  globalLimit: process.env.GLOBAL_LIMIT,
}));

export const throttlingValidation = Joi.object({
  APP_TTL: Joi.number()
    .integer()
    .positive()
    .required()
    .description(
      'Time-to-live for application-specific rate limits (in milliseconds)',
    ),
  APP_LIMIT: Joi.number()
    .integer()
    .positive()
    .required()
    .description(
      'Limit for application-specific rate limits (number of requests)',
    ),
  GLOBAL_TTL: Joi.number()
    .integer()
    .positive()
    .required()
    .description('Time-to-live for global rate limits (in milliseconds)'),
  GLOBAL_LIMIT: Joi.number()
    .integer()
    .positive()
    .required()
    .description('Limit for global rate limits (number of requests)'),
});

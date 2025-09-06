import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DB_URI,
}));
export const databaseValidation = Joi.object({
  DB_URI: Joi.string().uri().required().description('Database connection URL'),
});

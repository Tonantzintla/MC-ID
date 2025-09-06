import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const pluginConfig = registerAs('plugin', () => ({
  key: process.env.PLUGIN_KEY,
}));

export const pluginValidation = Joi.object({
  PLUGIN_KEY: Joi.string()
    .required()
    .description('Key for the minecraft plugin'),
});

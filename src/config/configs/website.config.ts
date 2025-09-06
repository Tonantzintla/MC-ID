import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const websiteConfig = registerAs('website', () => ({
  appId: process.env.WEBSITE_APP_ID,
  appSecret: process.env.WEBSITE_APP_SECRET,
  appMcid: process.env.WEBSITE_APP_MCID,
  jwksUri: process.env.WEBSITE_JWKS_URI,
}));

export const websiteValidation = Joi.object({
  WEBSITE_APP_ID: Joi.string()
    .required()
    .description('The ID of the app entry for the website in the database.'),
  WEBSITE_APP_SECRET: Joi.string()
    .required()
    .description(
      'The secret of the app entry for the website in the database.',
    ),
  WEBSITE_APP_MCID: Joi.string()
    .length(32)
    .required()
    .description('The minecraft UUID of the owner of the website app entry.'),
  WEBSITE_JWKS_URI: Joi.string()
    .uri()
    .required()
    .description(
      'The JWKS URI for the website, used for verifying JWTs issued by the website.',
    ),
});

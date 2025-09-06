import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { databaseConfig, databaseValidation } from './configs/database.config';
import { validationSchema } from './env.validation';
import { pluginConfig, pluginValidation } from './configs/plugin.config';
import { websiteConfig, websiteValidation } from './configs/website.config';
import * as Joi from 'joi';
import {
  throttlingConfig,
  throttlingValidation,
} from './configs/throttling.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, pluginConfig, websiteConfig, throttlingConfig],
      validationSchema: Joi.object()
        .concat(validationSchema)
        .concat(databaseValidation)
        .concat(pluginValidation)
        .concat(websiteValidation)
        .concat(throttlingValidation),
      validationOptions: {
        abortEarly: false,
      },
    }),
  ],
})
export class ConfigModule {}

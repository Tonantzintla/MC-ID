import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import cookieParser from 'cookie-parser';
import { Express } from 'express'; // 👈 make sure this is imported
import { AppModule } from './app.module';
import { ThrottlerFilter } from './filters/throttler.filter';
import { swaggerConfig } from './swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new ThrottlerFilter());

  app.use(cookieParser());
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(','),
    credentials: true,
  });

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.set('trust proxy', true);

  expressApp.get(
    '/',
    apiReference({
      spec: {
        content: document,
      },
      theme: 'saturn',
      metaData: {
        title: 'Documentation | MC-ID API',
        description: 'Documentation for the MC-ID API',
        ogDescription: 'Documentation for the MC-ID API',
        ogTitle: 'Documentation | MC-ID API',
        ogImage: '/assets/MC-ID.png',
        twitterCard: 'summary_large_image',
      },
      favicon: '/favicon.svg',
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

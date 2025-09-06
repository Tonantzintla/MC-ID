import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { AppsModule } from './apps/apps.module';
import { AuthModule } from './auth/auth.module';
import { CodesModule } from './codes/codes.module';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { MojangModule } from './mojang/mojang.module';
import { PluginModule } from './plugin/plugin.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule,
    PluginModule,
    DatabaseModule,
    AuthModule,
    CodesModule,
    UsersModule,
    MojangModule,
    AppsModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: configService.getOrThrow<number>('throttling.globalTTL'),
            limit: configService.getOrThrow<number>('throttling.globalLimit'),
          },
          {
            name: 'app',
            ttl: configService.getOrThrow<number>('throttling.appTTL'),
            limit: configService.getOrThrow<number>('throttling.appLimit'),
          },
        ],
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '../public'),
      serveRoot: '/',
    }),
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

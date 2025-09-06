import { Module } from '@nestjs/common';
import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { WebsiteService } from './initialize/website.service';

@Module({
  controllers: [AppsController],
  providers: [AppsService, WebsiteService],
  imports: [UsersModule, AuthModule],
  exports: [AppsService],
})
export class AppsModule {}

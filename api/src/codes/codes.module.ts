import { Module } from '@nestjs/common';
import { CodesService } from './codes.service';
import { CodesController } from './codes.controller';
import { MojangModule } from 'src/mojang/mojang.module';
import { UsersModule } from 'src/users/users.module';
import { AppsModule } from 'src/apps/apps.module';

@Module({
  providers: [CodesService],
  exports: [CodesService],
  controllers: [CodesController],
  imports: [MojangModule, UsersModule, AppsModule],
})
export class CodesModule {}

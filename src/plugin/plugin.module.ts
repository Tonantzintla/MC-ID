import { Module } from '@nestjs/common';
import { PluginService } from './plugin.service';
import { PluginController } from './plugin.controller';
import { CodesModule } from 'src/codes/codes.module';

@Module({
  imports: [CodesModule],
  providers: [PluginService],
  controllers: [PluginController],
})
export class PluginModule {}

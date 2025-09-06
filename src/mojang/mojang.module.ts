import { Module } from '@nestjs/common';
import { MojangService } from './mojang.service';

@Module({
  providers: [MojangService],
  exports: [MojangService],
})
export class MojangModule {}

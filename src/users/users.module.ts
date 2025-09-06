import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MojangModule } from 'src/mojang/mojang.module';

@Module({
  providers: [UsersService],
  exports: [UsersService],
  imports: [MojangModule],
})
export class UsersModule {}

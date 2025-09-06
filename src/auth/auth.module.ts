import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { MojangModule } from 'src/mojang/mojang.module';
import { JwtGuard } from './guards/jwt.guard';
import { JwtValidationService } from './jwt-validation/jwt-validation.service';

@Module({
  providers: [JwtGuard, JwtValidationService],
  imports: [UsersModule, MojangModule],
  exports: [JwtGuard, JwtValidationService],
})
export class AuthModule {}

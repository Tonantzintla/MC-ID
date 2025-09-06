import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class PluginKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('HI');
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer '))
      throw new UnauthorizedException(
        'Authorization header missing or invalid.',
      );

    const token = authHeader.split(' ')[1];
    const expectedToken = this.configService.getOrThrow<string>('plugin.key');

    if (!token || token !== expectedToken) {
      console.log(token, expectedToken);
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }
}

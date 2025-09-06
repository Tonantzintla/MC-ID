import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AppsService } from '../apps.service';

@Injectable()
export class AppGuard implements CanActivate {
  constructor(private appsService: AppsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { appId, appSecret } = request.body as AppAuthBody;
    if (!appId || !appSecret) {
      throw new UnauthorizedException('App ID and App Secret are required.');
    }

    const isValid = await this.appsService.validateAppSecret(appId, appSecret);

    if (!isValid) {
      throw new UnauthorizedException('Invalid App ID or App Secret.');
    }
    return true;
  }
}

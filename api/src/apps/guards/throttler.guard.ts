import { ThrottlerGuard } from '@nestjs/throttler';

export class AppThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const appId = (req.body as { appId?: string })?.appId;
    return Promise.resolve(appId || (req.ip as string));
  }
}

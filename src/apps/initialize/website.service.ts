import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HASHING_OPTIONS } from 'src/config/configs/security.config';
import * as argon from '@node-rs/argon2';
import { UsersService } from 'src/users/users.service';
import { AppsService } from '../apps.service';

@Injectable()
export class WebsiteService {
  private readonly logger = new Logger(WebsiteService.name);

  constructor(
    private configService: ConfigService,
    private appsService: AppsService,
    private usersService: UsersService,
  ) {}
  async onModuleInit() {
    try {
      this.logger.log('Initializing website app.');
      await this.ensureWebsiteApp();
      this.logger.log('Successfully initialized website app!');
    } catch (error) {
      if (error instanceof Error)
        return this.logger.error(
          'Error during website app initialization: ',
          error.message,
        );
      this.logger.error(
        'Unknown error during website app initialization: ',
        error,
      );
    }
  }

  private async ensureWebsiteApp() {
    const appId = this.configService.getOrThrow<string>('website.appId');
    const appSecret =
      this.configService.getOrThrow<string>('website.appSecret');
    const appMcid = this.configService.getOrThrow<string>('website.appMcid');

    const foundApp = await this.appsService.findById(appId, true);

    if (foundApp) {
      this.logger.log(`Website application found with ID: ${appId}`);

      const secretsMatch = await this.appsService.compareSecrets(
        foundApp.secret,
        appSecret,
      );
      if (!secretsMatch) {
        this.logger.warn(
          'Website app secret has changed. Updating database entry.',
        );
        await this.appsService.updateSecret(appId, appSecret);
      }

      if (!foundApp.user || appMcid !== foundApp.user.id) {
        this.logger.warn(
          "Website app owner's Minecraft ID has changed or is missing. Updating owner...",
        );
        const user = await this.usersService.findOrCreateUser(appMcid);
        await this.appsService.updateOwner(appId, user.id);
        this.logger.log(`Website app owner updated to user ID: ${user.id}`);
      }
    } else {
      this.logger.log(
        `Website application with ID: ${appId} not found. Creating a new entry...`,
      );

      const user = await this.usersService.findOrCreateUser(appMcid);

      await this.appsService.createApp({
        id: appId,
        name: 'MC-ID',
        secret: await argon.hash(appSecret, HASHING_OPTIONS),
        website: 'https://mc-id.com',
        userId: user.id,
      });
      this.logger.log(
        `Successfully created website application with ID: ${appId} and linked to user ID: ${user.id}.`,
      );
    }
  }
}

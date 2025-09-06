import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { and, desc, eq, gte } from 'drizzle-orm';
import * as crypto from 'node:crypto';
import { DrizzleDB } from 'src/database/database';
import { verificationCodes } from 'src/database/schemas';
import { MojangService } from 'src/mojang/mojang.service';
import { UsersService } from 'src/users/users.service';
import RequestCodeDto from './dtos/request-code.dto';
import VerifyCodeDto from './dtos/verify-code.dto';

@Injectable()
export class CodesService {
  private logger = new Logger(CodesService.name);

  constructor(
    @Inject('DRIZZLE_ORM') private db: DrizzleDB,
    private mojangService: MojangService,
    private usersService: UsersService,
  ) {}

  generateSixDigitCode() {
    return new Promise<string>((res, rej) => {
      crypto.randomInt(100000, 999999, (err, n) => {
        if (err) {
          console.error('Failed to generate secure random number:', err);
          return rej(
            new InternalServerErrorException(
              'Failed to generate verification code securely.',
            ),
          );
        }
        res(n.toString());
      });
    });
  }

  async getLatestCodeByMC(mcid: string) {
    const user = await this.db.query.users.findFirst({
      where: (u) => eq(u.id, mcid),
    });
    if (!user) return null;

    const found = await this.db.query.verificationCodes.findFirst({
      where: (vc) =>
        and(eq(vc.userId, user?.id), gte(vc.expiration, new Date())),
      with: { app: true },
      orderBy: (vc) => [desc(vc.createdAt)],
    });
    if (found) return { code: found.code, appName: found.app.name };

    return null;
  }

  getCodeWithPlayer(code: string) {
    return this.db.query.verificationCodes.findFirst({
      where: (vc) => and(eq(vc.code, code), gte(vc.expiration, new Date())),
      with: { user: true },
      orderBy: (vc) => [desc(vc.createdAt)],
    });
  }

  deleteCode(code: string) {
    return this.db
      .delete(verificationCodes)
      .where(eq(verificationCodes.code, code));
  }

  async addCodeToPlayer(userId: string, appId: string) {
    const code = await this.generateSixDigitCode();
    const expiration = new Date(Date.now() + 1000 * 60 * 5);
    return (
      await this.db
        .insert(verificationCodes)
        .values({
          appId,
          userId,
          code,
          expiration,
        })
        .onConflictDoUpdate({
          target: [verificationCodes.appId, verificationCodes.userId],
          set: {
            code,
            expiration,
          },
        })
        .returning()
    )[0];
  }

  async requestCode(requestCodeDto: RequestCodeDto) {
    const username = await this.mojangService.getUsernameFromMcid(
      requestCodeDto.uuid,
    );

    if (!username)
      throw new BadRequestException(`Minecraft username not found`);

    try {
      const user = await this.usersService.findOrCreateUser(
        requestCodeDto.uuid,
      );

      await this.addCodeToPlayer(user.id, requestCodeDto.appId);
      return { message: 'Successfully generated the code.', userId: user.id };
    } catch (error) {
      this.logger.error(error);

      throw new InternalServerErrorException(
        "Couldn't generate a code for the user.",
      );
    }
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto) {
    const data = await this.getCodeWithPlayer(verifyCodeDto.code);

    if (!data || data.user.id !== verifyCodeDto.uuid)
      throw new UnauthorizedException('Invalid verification code.');
    await this.deleteCode(verifyCodeDto.code);

    const username = await this.mojangService.getUsernameFromMcid(
      verifyCodeDto.uuid,
    );

    return { id: data.user.id, username };
  }
}

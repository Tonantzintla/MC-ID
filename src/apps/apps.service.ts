import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleDB } from 'src/database/database';
import { HASHING_OPTIONS } from 'src/config/configs/security.config';
import * as crypto from 'node:crypto';
import { apps, users } from 'src/database/schemas';
import { and, eq } from 'drizzle-orm';
import * as argon from '@node-rs/argon2';

type CreateAppInput = Omit<typeof apps.$inferInsert, 'secret'> &
  Partial<Pick<typeof apps.$inferInsert, 'secret'>>;
type AppWithUser = typeof apps.$inferSelect & {
  user: typeof users.$inferSelect;
};
type AppWithoutUser = typeof apps.$inferSelect;

@Injectable()
export class AppsService {
  constructor(@Inject('DRIZZLE_ORM') private db: DrizzleDB) {}

  findById(id: string, includeUser: true): Promise<AppWithUser | undefined>; //Overloads
  findById(
    id: string,
    includeUser?: false,
  ): Promise<AppWithoutUser | undefined>;
  findById(
    id: string,
    includeUser?: boolean,
  ): Promise<AppWithUser | AppWithoutUser | undefined> {
    return this.db.query.apps.findFirst({
      where: (fields) => eq(fields.id, id),
      with: includeUser ? { user: true } : undefined,
    });
  }

  findAllByUserId(id: string) {
    return this.db.query.apps.findMany({ where: (app) => eq(app.userId, id) });
  }

  generateRandomSecret(length = 32) {
    if (length % 2 !== 0) {
      throw new Error(
        'Length must be an even number for hexadecimal representation.',
      );
    }
    const numBytes = length / 2;
    return crypto.randomBytes(numBytes).toString('hex');
  }
  async compareSecrets(hashed: string, secret: string) {
    try {
      return await argon.verify(hashed, secret);
    } catch {
      return false;
    }
  }

  async validateAppSecret(appId: string, appSecret: string) {
    const app = await this.findById(appId);
    if (!app) return false;
    return await this.compareSecrets(app.secret, appSecret);
  }

  async updateSecret(appId: string, secret: string, userId?: string) {
    return (
      await this.db
        .update(apps)
        .set({ secret: await argon.hash(secret, HASHING_OPTIONS) })
        .where(
          and(eq(apps.id, appId), userId ? eq(apps.userId, userId) : undefined),
        )
        .returning()
    )[0];
  }

  async updateOwner(appId: string, userId: string) {
    return (
      await this.db
        .update(apps)
        .set({ userId })
        .where(eq(apps.id, appId))
        .returning()
    )[0];
  }

  async createApp(appData: CreateAppInput) {
    const secret = this.generateRandomSecret();
    const app = (
      await this.db
        .insert(apps)
        .values({
          ...appData,
          secret: await argon.hash(secret, HASHING_OPTIONS),
        })
        .returning()
    )[0];
    return { ...app, secret };
  }

  async deleteApp(id: string, uuid: string) {
    const deleted = (
      await this.db
        .delete(apps)
        .where(and(eq(apps.userId, uuid), eq(apps.id, id)))
        .returning()
    )[0];

    if (!deleted) throw new NotFoundException('App not found');

    return deleted;
  }

  async getApps(userId: string) {
    return this.findAllByUserId(userId);
  }

  async getApp(id: string, userId: string) {
    const app = await this.findById(id);
    if (!app || app?.userId != userId)
      throw new NotFoundException('App not found');
    return app;
  }

  async editApp(
    appId: string,
    userId: string,
    updates: Partial<
      Omit<typeof apps.$inferInsert, 'id' | 'secret' | 'userId'>
    >,
  ) {
    if (Object.values(updates).every((value) => value === undefined))
      throw new BadRequestException('No fields provided for update.');

    const { secret: _secret, ...updated } = (
      await this.db
        .update(apps)
        .set(updates)
        .where(and(eq(apps.id, appId), eq(apps.userId, userId)))
        .returning()
    )[0];
    if (!updated) throw new NotFoundException('App not found');
    return updated;
  }

  async resetAppSecret(appId: string, userId: string) {
    const secret = this.generateRandomSecret();
    const app = await this.updateSecret(appId, secret, userId);
    if (!app) throw new NotFoundException('App not found');
    return { secret };
  }
}

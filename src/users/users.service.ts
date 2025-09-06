import { Inject, Injectable, Logger } from '@nestjs/common';
import { DrizzleDB } from 'src/database/database';
import { eq } from 'drizzle-orm';
import { users } from 'src/database/schemas';
import { MojangService } from 'src/mojang/mojang.service';

type CreateUserInput = typeof users.$inferInsert;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject('DRIZZLE_ORM') private db: DrizzleDB,
    private mojangService: MojangService,
  ) {}

  async findByID(id: string) {
    return (
      (await this.db.query.users.findFirst({
        where: (user) => eq(user.id, id),
      })) || null
    );
  }

  async createUser(user: CreateUserInput) {
    return (
      await this.db
        .insert(users)
        .values({ ...user })
        .returning()
    )[0];
  }

  async findOrCreateUser(id: string) {
    let user = await this.findByID(id);
    if (!user) {
      this.logger.log(`User with ID: ${id} not found. Creating a new user...`);
      user = await this.createUser({ id });
      if (!user) {
        throw new Error(`Failed to create user with ID: ${id}.`);
      }
      this.logger.log(`Successfully created user with ID: ${user.id}`);
    } else {
      this.logger.log(`Found existing user with ID: ${user.id}.`);
    }
    return user;
  }
}

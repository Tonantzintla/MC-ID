import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from './schemas';
export type DrizzleDB = NodePgDatabase<typeof sc>;

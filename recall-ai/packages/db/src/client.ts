import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let db: PostgresJsDatabase<typeof schema> | null = null;

export const getDb = (connectionString: string): PostgresJsDatabase<typeof schema> => {
  if (!db) {
    const queryClient = postgres(connectionString);
    db = drizzle(queryClient, { schema });
  }
  return db;
};

export type DB = PostgresJsDatabase<typeof schema>;
export { schema };

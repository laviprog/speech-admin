import { drizzle } from 'drizzle-orm/node-postgres';

export const database = drizzle(process.env.DATABASE_URL!);

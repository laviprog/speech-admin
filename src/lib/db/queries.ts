import { admins } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { database } from '.';
import { randomUUID } from 'crypto';
import argon2 from 'argon2';

export async function get_admin(email: string) {
  const [admin] = await database.select().from(admins).where(eq(admins.email, email));
  return admin;
}

export async function create_admin(email: string, password: string) {
  const now = new Date();
  const hash = await argon2.hash(password);
  await database.insert(admins).values({
    id: randomUUID(),
    email: email,
    password: hash,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    saOrmSentinel: null,
  });
}

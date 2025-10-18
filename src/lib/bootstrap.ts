'use server';
import 'server-only';
import { create_admin, get_admin } from './db/queries';

declare global {
  var __BOOTSTRAPPED_DEFAULT_ADMIN__: boolean | undefined;
}

export async function bootstrapDefaultAdmin() {
  if (global.__BOOTSTRAPPED_DEFAULT_ADMIN__) return;
  global.__BOOTSTRAPPED_DEFAULT_ADMIN__ = true;

  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;

  if (!email || !password) return;

  const existing = await get_admin(email);
  if (existing) {
    console.log('Admin already exists');
    return;
  }

  try {
    await create_admin(email, password);
    console.log(`[bootstrap] создан дефолтный админ: ${email}`);
  } catch (err) {
    console.error(`[bootstrap] ошибка при создании дефолтного админа: ${err}`);
  }
}

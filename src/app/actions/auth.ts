'use server';

import { redirect } from 'next/navigation';
import { login as authLogin, setAuthCookie, removeAuthCookie } from '@/lib/auth';
import { LoginCredentials } from '@/types/auth';

export async function loginAction(credentials: LoginCredentials) {
  try {
    const response = await authLogin(credentials);
    await setAuthCookie(response.access_token);
    redirect('/');
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
}

export async function logoutAction() {
  await removeAuthCookie();
  redirect('/login');
}

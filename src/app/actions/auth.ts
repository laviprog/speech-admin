'use server';

import { redirect } from 'next/navigation';
import { login as authLogin, removeAuthCookie, setAuthCookie } from '@/lib/auth';
import { LoginCredentials } from '@/types/auth';

export async function loginAction(credentials: LoginCredentials) {
  try {
    const response = await authLogin(credentials);
    await setAuthCookie(response.access_token);
  } catch (error) {
    console.error(error);
    return {
      error: 'Login failed',
    };
  }

  redirect('/');
}

export async function logoutAction() {
  await removeAuthCookie();
  redirect('/login');
}

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { AuthResponse, LoginCredentials, TokenPayload, User } from '@/types/auth';
import { get_admin } from '@/lib/db/queries';

type IssuePayload = Omit<TokenPayload, 'exp'>;
const JWT_SECRET = process.env.JWT_SECRET!;
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME!;

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { email, password } = credentials;
  const admin = await get_admin(email);
  if (!admin) throw new Error('Invalid credentials');
  const ok = await argon2.verify(admin.password, password);
  if (!ok) throw new Error('Invalid credentials');

  const payload: IssuePayload = { id: admin.id, email: admin.email };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
  return { access_token: token, token_type: 'Bearer' };
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

function checkTokenExpiry(exp: number): boolean {
  const currentTime = Math.floor(Date.now() / 1000);
  return exp > currentTime;
}

export function decodeJWT(token: string): User | null {
  try {
    const payload: TokenPayload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString()
    );
    if (!checkTokenExpiry(payload.exp)) {
      return null;
    }
    return {
      id: payload.id,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const user = decodeJWT(token);
  if (!user) {
    await removeAuthCookie();
    return null;
  }

  return user;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Wallet-based session: encrypted cookie (iron-session) tying the session to a Stellar address.
 * Env: SESSION_PASSWORD — must be at least 32 characters (e.g. `openssl rand -base64 32`).
 */

import { sealData, unsealData } from 'iron-session';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'remitwise_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export interface SessionData {
  address: string;
  createdAt: number;
  expiresAt?: number;
}

function getPassword(): string {
  const password = process.env.SESSION_PASSWORD;
  if (!password || password.length < 32) {
    throw new Error(
      'SESSION_PASSWORD must be set and at least 32 characters (e.g. openssl rand -base64 32)'
    );
  }
  return password;
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const encrypted = cookieStore.get(SESSION_COOKIE)?.value;

  if (!encrypted) return null;

  try {
    const data = await unsealData<SessionData>(encrypted, {
      password: getPassword(),
    });
    if (data?.expiresAt && Date.now() > data.expiresAt) return null;
    return data ?? null;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<{ address: string }> {
  const session = await getSession();
  if (!session?.address) {
    throw new Response(
      JSON.stringify({ error: 'Unauthorized', message: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return { address: session.address };
}

export async function createSession(address: string): Promise<string> {
  const now = Date.now();
  const expiresAt = now + SESSION_MAX_AGE * 1000;
  const session: SessionData = { address, createdAt: now, expiresAt };
  const sealed = await sealData(session, {
    password: getPassword(),
    ttl: SESSION_MAX_AGE,
  });
  return sealed;
}

export function getSessionCookieHeader(sealed: string): string {
  return `${SESSION_COOKIE}=${sealed}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

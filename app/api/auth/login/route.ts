import { NextRequest } from 'next/server';
import { Keypair } from '@stellar/stellar-sdk';
import {
  createSession,
  getSessionCookieHeader,
} from '../../../../lib/session';

export const dynamic = 'force-dynamic';

/**
 * Wallet-based auth flow:
 * 1. Frontend: user connects wallet (e.g. Freighter), gets address.
 * 2. Frontend: build a nonce message (e.g. "Sign in to Remitwise at {timestamp}").
 * 3. Frontend: sign message with wallet (Keypair.fromSecretKey(secret).sign(Buffer.from(message, 'utf8'))), encode as base64.
 * 4. Frontend: POST /api/auth/login with { address, message, signature } (credentials sent in body; cookie set in response).
 * 5. Backend: verify with Keypair.fromPublicKey(address).verify(messageBuffer, signatureBuffer); create encrypted session cookie.
 * Env: SESSION_PASSWORD (min 32 chars, e.g. openssl rand -base64 32).
 */

export interface LoginBody {
  address: string;
  signature: string;
  message: string;
}

function verifyStellarSignature(
  address: string,
  message: string,
  signatureBase64: string
): boolean {
  try {
    const keypair = Keypair.fromPublicKey(address);
    const data = Buffer.from(message, 'utf8');
    const signature = Buffer.from(signatureBase64, 'base64');
    return keypair.verify(data, signature);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginBody;
    const { address, signature, message } = body;

    if (!address || !signature || !message) {
      return Response.json(
        { error: 'Bad request', message: 'address, signature, and message are required' },
        { status: 400 }
      );
    }

    if (!verifyStellarSignature(address, message, signature)) {
      return Response.json(
        { error: 'Unauthorized', message: 'Invalid signature' },
        { status: 401 }
      );
    }

    const sealed = await createSession(address);
    const cookieHeader = getSessionCookieHeader(sealed);

    return new Response(
      JSON.stringify({ ok: true, address }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader,
        },
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

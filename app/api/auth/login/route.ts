import { NextRequest, NextResponse } from 'next/server';
import { Keypair } from '@stellar/stellar-sdk';
import { getAndClearNonce } from '@/lib/auth-cache';
import {
  createSession,
  getSessionCookieHeader,
} from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Wallet-based auth flow:
 * 1. Frontend: user connects wallet (e.g. Freighter), gets address.
 * 2. Frontend: GET /api/auth/nonce?address={address} to get a random nonce.
 * 3. Frontend: sign the hex nonce with wallet, encode as base64.
 * 4. Frontend: POST /api/auth/login with { address, signature }.
 * 5. Backend: verify signature with Keypair; create encrypted session cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, signature } = body;

    if (!address || !signature) {
      return NextResponse.json(
        { error: 'Address and signature are required' },
        { status: 400 }
      );
    }

    // Retrieve and clear nonce — returns null if missing or expired
    const nonce = getAndClearNonce(address);
    if (!nonce) {
      return NextResponse.json(
        { error: 'Nonce expired or missing. Please request a new nonce.' },
        { status: 401 }
      );
    }

    // Verify signature
    try {
      const keypair = Keypair.fromPublicKey(address);
      // Nonce is stored as hex string; signature is base64 from the client.
      const isValid = keypair.verify(
        Buffer.from(nonce, 'hex'),
        Buffer.from(signature, 'base64')
      );

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } catch {
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      );
    }

    const sealed = await createSession(address);
    const cookieHeader = getSessionCookieHeader(sealed);

    return new Response(
      JSON.stringify({ success: true, address }),
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

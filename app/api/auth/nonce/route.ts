import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { storeNonce } from '@/lib/auth/nonce-store';

import { setNonce } from "@/lib/auth-cache";

// Force dynamic rendering to ensure fresh nonces
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Validates a Stellar address (G + 55 alphanumeric characters)
 */
function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z0-9]{55}$/.test(address);
}

/**
 * Extracts address from query params or request body
 */
function resolveAddressFromRequest(request: NextRequest, body?: any): string | null {
  const queryAddress = request.nextUrl.searchParams.get('address')?.trim();
  if (queryAddress) return queryAddress;

  if (body && typeof body === 'object') {
    const address = (body.publicKey || body.address);
    if (typeof address === 'string') return address.trim();
  }

  return null;
}

async function handleNonceRequest(request: NextRequest) {
  try {
    let body: any = null;
    if (request.method === 'POST') {
      try {
        body = await request.json();
      } catch {
        // Fallback to query params if JSON parsing fails
      }
    }

    const address = resolveAddressFromRequest(request, body);

    if (!address || !isValidStellarAddress(address)) {
      return NextResponse.json(
        { error: 'Valid Stellar address is required (e.g., ?address=G...)' },
        { status: 400 }
      );
    }

    // Generate a 32-byte random nonce
    const nonce = randomBytes(32).toString('hex');

    // Store nonce (typically handles expiration internally)
    await storeNonce(address, nonce);

    return NextResponse.json({
      nonce,
      address,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }


export async function POST(request: NextRequest) {
  const { publicKey } = await request.json();

  if (!publicKey) {
    return NextResponse.json(
      { error: "publicKey is required" },
      { status: 400 },
    );
  }

  // Generate a random nonce (32 bytes) and convert to hex
  const nonceBuffer = randomBytes(32);
  const nonce = nonceBuffer.toString("hex");

  // Store nonce in cache for later verification
  setNonce(publicKey, nonce);

  return NextResponse.json({ nonce });
}

export async function GET(request: NextRequest) {
  return handleNonceRequest(request);
}

export async function POST(request: NextRequest) {
  return handleNonceRequest(request);
}
import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { setNonce } from '@/lib/auth-cache';

function resolveAddressFromRequest(request: NextRequest, body?: unknown): string | null {
  const queryAddress = request.nextUrl.searchParams.get('address')?.trim();
  if (queryAddress) return queryAddress;

  if (!body || typeof body !== 'object') return null;
  const input = body as Record<string, unknown>;
  const address =
    (typeof input.publicKey === 'string' && input.publicKey.trim()) ||
    (typeof input.address === 'string' && input.address.trim()) ||
    null;
  return address;
}

function isValidStellarAddress(address: string): boolean {
  return address.length === 56 && address.startsWith('G');
}

function createNonce(): string {
  // 32 random bytes encoded as hex; login verifies signature over raw bytes.
  return randomBytes(32).toString('hex');
}

export async function GET(request: NextRequest) {
  const address = resolveAddressFromRequest(request);
  if (!address || !isValidStellarAddress(address)) {
    return NextResponse.json(
      { error: 'Valid Stellar address is required as ?address=' },
      { status: 400 }
    );
  }

  const nonce = createNonce();
  setNonce(address, nonce);
  return NextResponse.json({ nonce });
}

export async function POST(request: NextRequest) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    // Keep null to allow query-param fallback.
  }

  const address = resolveAddressFromRequest(request, body);
  if (!address || !isValidStellarAddress(address)) {
    return NextResponse.json(
      { error: 'Valid Stellar address is required in body or query' },
      { status: 400 }
    );
  }

  const nonce = createNonce();
  setNonce(address, nonce);
  return NextResponse.json({ nonce });
}

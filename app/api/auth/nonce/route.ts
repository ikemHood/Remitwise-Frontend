import { NextRequest, NextResponse } from 'next/server';
import { setNonce } from '@/lib/auth-cache';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  const nonce = crypto.randomBytes(16).toString('hex');
  setNonce(address, nonce);

  return NextResponse.json({ nonce });
}

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();
    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }
    const nonce = crypto.randomBytes(16).toString('hex');
    setNonce(address, nonce);
    return NextResponse.json({ nonce });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

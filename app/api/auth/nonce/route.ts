import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { publicKey } = await request.json();
  // TODO: Generate and store nonce for signature verification
  const nonce = Math.random().toString(36).substring(7);
  return NextResponse.json({ nonce });
}

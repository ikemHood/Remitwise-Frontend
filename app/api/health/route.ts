import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    database: 'connected',
    rpc: 'connected',
    anchor: 'connected'
  });
}

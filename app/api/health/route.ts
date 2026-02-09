import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Healthy',
    timestamp: new Date().toISOString(),
  });
}

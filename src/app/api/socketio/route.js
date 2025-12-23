// Socket.io API route handler for Next.js App Router
// This is a workaround since custom server doesn't work well with App Router
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Socket.io endpoint',
    note: 'Socket.io should be initialized in server.js custom server file'
  });
}


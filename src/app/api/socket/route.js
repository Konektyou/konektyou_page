// Socket.io API route handler
import { NextResponse } from 'next/server';

// This route is just for Socket.io path configuration
// The actual Socket.io server is initialized in the custom server
export async function GET() {
  return NextResponse.json({ message: 'Socket.io endpoint' });
}


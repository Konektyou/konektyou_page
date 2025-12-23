// Health check endpoint to verify Socket.io is running
import { NextResponse } from 'next/server';

export async function GET() {
  const isSocketRunning = typeof global.io !== 'undefined' && global.io !== null;
  
  return NextResponse.json({
    socketRunning: isSocketRunning,
    message: isSocketRunning 
      ? '✅ Socket.io server is running!' 
      : '❌ Socket.io server is NOT running. Use: npm run dev',
    instructions: isSocketRunning 
      ? null 
      : [
          '1. Stop current server (Ctrl+C)',
          '2. Run: npm run dev',
          '3. Look for "Socket.io server initialized" in terminal',
          '4. Refresh this page'
        ]
  });
}


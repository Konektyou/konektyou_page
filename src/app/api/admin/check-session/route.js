import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');
    
    if (!sessionCookie) {
      return NextResponse.json({
        authenticated: false,
        admin: null
      });
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      return NextResponse.json({
        authenticated: true,
        admin: session
      });
    } catch (error) {
      // Invalid session cookie
      cookieStore.delete('admin_session');
      return NextResponse.json({
        authenticated: false,
        admin: null
      });
    }
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, admin: null, error: error.message },
      { status: 500 }
    );
  }
}


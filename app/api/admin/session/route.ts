import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const COOKIE_NAME = 'sarkarisetu-admin-token';

export async function POST(request: Request) {
  try {
    const { access_token } = await request.json();

    if (!access_token || typeof access_token !== 'string') {
      return NextResponse.json({ error: 'Missing access token.' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: { user }, error } = await supabase.auth.getUser(access_token);

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
    }

    if (user.app_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to create admin session.' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

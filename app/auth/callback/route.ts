// /app/auth/callback/route.ts

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);

    // Get the full user object
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(user); // Contains identity data
  }

  return NextResponse.redirect(requestUrl.origin);
}

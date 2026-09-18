import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return new Response('No authorization code', { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const isDev = process.env.NODE_ENV === 'development';
    const redirectUri = isDev
      ? 'http://localhost:3000/api/auth/gmail/callback'
      : 'https://recall-ai-new.vercel.app/api/auth/gmail/callback';

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Token error:', error);
      return new Response('Failed to get token', { status: 400 });
    }

    const { access_token, refresh_token } = await tokenResponse.json();

    // Get Supabase session from state or cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response('Config error', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store tokens (in real app, use secure storage)
    // For now, redirect to app with token
    const redirectUrl = new URL(`${new URL(request.url).origin}/app/today`);
    redirectUrl.searchParams.set('gmail_token', access_token);

    return Response.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Gmail callback error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
}

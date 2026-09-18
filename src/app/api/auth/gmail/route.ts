export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const isDev = process.env.NODE_ENV === 'development';
  const redirectUri = isDev
    ? 'http://localhost:3000/api/auth/gmail/callback'
    : 'https://recall-ai-new.vercel.app/api/auth/gmail/callback';

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId!);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/gmail.readonly');
  authUrl.searchParams.set('access_type', 'offline');

  return Response.redirect(authUrl.toString());
}

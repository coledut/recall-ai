export async function GET(request: Request) {
  const clientId = process.env.SLACK_CLIENT_ID;
  const isDev = process.env.NODE_ENV === 'development';
  const redirectUri = isDev
    ? 'http://localhost:3000/api/auth/slack/callback'
    : 'https://recall-ai-new.vercel.app/api/auth/slack/callback';

  const authUrl = new URL('https://slack.com/oauth/v2/authorize');
  authUrl.searchParams.set('client_id', clientId!);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'channels:read channels:history users:read');
  authUrl.searchParams.set('user_scope', '');

  return Response.redirect(authUrl.toString());
}

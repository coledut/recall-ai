export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return new Response('No authorization code', { status: 400 });
    }

    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const isDev = process.env.NODE_ENV === 'development';
    const redirectUri = isDev
      ? 'http://localhost:3000/api/auth/slack/callback'
      : 'https://recall-ai-new.vercel.app/api/auth/slack/callback';

    // Exchange code for token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Slack token error:', error);
      return new Response('Failed to get token', { status: 400 });
    }

    const { access_token } = await tokenResponse.json();

    // Redirect to app with token
    const redirectUrl = new URL(`${new URL(request.url).origin}/app/today`);
    redirectUrl.searchParams.set('slack_token', access_token);

    return Response.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Slack callback error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
}

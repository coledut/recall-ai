import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { accessToken, authToken } = await request.json();

    if (!accessToken || !authToken) {
      return Response.json({ error: 'Missing tokens' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch recent emails from Gmail
    const gmailRes = await fetch(
      'https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=is:unread',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!gmailRes.ok) {
      return Response.json({ error: 'Gmail API error' }, { status: 400 });
    }

    const gmailData = await gmailRes.json();
    const messages = gmailData.messages || [];

    let extractedCount = 0;

    // Process each email
    for (const msg of messages) {
      const msgRes = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const msgData = await msgRes.json();
      const headers = msgData.payload.headers;
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No subject';
      const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';

      // Extract email body (simplified)
      let body = '';
      if (msgData.payload.parts) {
        const textPart = msgData.payload.parts.find((p: any) => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString();
        }
      } else if (msgData.payload.body?.data) {
        body = Buffer.from(msgData.payload.body.data, 'base64').toString();
      }

      if (!body.trim()) continue;

      // Extract commitments using our AI
      const extractRes = await fetch(
        `${new URL(request.url).origin}/api/extract`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `Email from ${from}: ${subject}\n\n${body}`,
            authToken,
          }),
        }
      );

      if (extractRes.ok) {
        extractedCount++;
      }
    }

    return Response.json({
      success: true,
      extracted: extractedCount,
      total: messages.length,
    });
  } catch (error) {
    console.error('Gmail fetch error:', error);
    return Response.json({ error: 'Failed to fetch Gmail' }, { status: 500 });
  }
}

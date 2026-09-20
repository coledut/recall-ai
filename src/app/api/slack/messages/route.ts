import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { slackToken, authToken } = await request.json();

    if (!slackToken || !authToken) {
      return Response.json({ error: "Missing tokens" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: "Config error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch recent messages from Slack
    const messagesRes = await fetch(
      `https://slack.com/api/conversations.list?limit=20&exclude_archived=true&types=public_channel,private_channel,mpim,im`,
      {
        headers: { Authorization: `Bearer ${slackToken}` },
      }
    );

    if (!messagesRes.ok) {
      return Response.json({ error: "Slack API error" }, { status: 400 });
    }

    const conversationsData = await messagesRes.json();

    if (!conversationsData.ok) {
      return Response.json({ error: conversationsData.error }, { status: 400 });
    }

    const channels = conversationsData.channels || [];
    let extractedCount = 0;
    let totalMessages = 0;

    // Process each channel/conversation
    for (const channel of channels) {
      // Fetch messages from the last 24 hours
      const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
      const historyRes = await fetch(
        `https://slack.com/api/conversations.history?channel=${channel.id}&limit=30&oldest=${oneDayAgo}`,
        {
          headers: { Authorization: `Bearer ${slackToken}` },
        }
      );

      const historyData = await historyRes.json();
      if (!historyData.ok) continue;

      const messages = historyData.messages || [];
      totalMessages += messages.length;

      // Process messages in reverse chronological order
      for (const msg of messages) {
        if (!msg.text || msg.subtype === 'message_deleted' || msg.user === 'USLACKBOT') continue;

        // Build context-rich message text
        const channelName = channel.name || 'Direct Message';
        const messageText = `Slack message in #${channelName}:\n${msg.text}`;

        // Extract commitments from message
        const extractRes = await fetch(
          `${new URL(request.url).origin}/api/extract`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: messageText,
              authToken,
            }),
          }
        );

        if (extractRes.ok) {
          extractedCount++;
        }
      }
    }

    return Response.json({
      success: true,
      extracted: extractedCount,
      channels: channels.length,
      totalMessages,
    });
  } catch (error) {
    console.error("Slack messages error:", error);
    return Response.json({ error: "Failed to fetch Slack messages" }, { status: 500 });
  }
}

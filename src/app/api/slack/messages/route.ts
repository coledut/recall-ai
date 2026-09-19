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

    // Fetch recent messages from Slack (last 50 messages)
    const messagesRes = await fetch(
      `https://slack.com/api/conversations.list?limit=10&exclude_archived=true`,
      {
        headers: { Authorization: `Bearer ${slackToken}` },
      }
    );

    if (!messagesRes.ok) {
      return Response.json({ error: "Slack API error" }, { status: 400 });
    }

    const conversationsData = await messagesRes.json();
    console.log("Slack conversations response:", JSON.stringify(conversationsData).substring(0, 200));

    if (!conversationsData.ok) {
      return Response.json({ error: conversationsData.error }, { status: 400 });
    }

    const channels = conversationsData.channels || [];
    console.log("Found channels:", channels.length);
    let extractedCount = 0;

    // Process each channel
    for (const channel of channels) {
      console.log(`Fetching messages from channel: ${channel.name}`);
      const historyRes = await fetch(
        `https://slack.com/api/conversations.history?channel=${channel.id}&limit=20`,
        {
          headers: { Authorization: `Bearer ${slackToken}` },
        }
      );

      const historyData = await historyRes.json();
      const messages = historyData.messages || [];
      console.log(`Channel ${channel.name} has ${messages.length} messages`);

      for (const msg of messages) {
        if (!msg.text || msg.subtype) continue; // Skip empty or special messages
        console.log(`Processing message: ${msg.text.substring(0, 50)}...`);

        // Extract commitments from message
        const extractRes = await fetch(
          `${new URL(request.url).origin}/api/extract`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: `Slack message: ${msg.text}`,
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
    });
  } catch (error) {
    console.error("Slack messages error:", error);
    return Response.json({ error: "Failed to fetch Slack messages" }, { status: 500 });
  }
}

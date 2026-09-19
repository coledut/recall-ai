import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { accessToken, authToken } = await request.json();

    if (!accessToken || !authToken) {
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

    // Fetch upcoming events from Google Calendar (next 30 days)
    const now = new Date().toISOString();
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const calendarRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${thirtyDaysLater}&maxResults=20&orderBy=startTime&singleEvents=true`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!calendarRes.ok) {
      return Response.json({ error: "Calendar API error" }, { status: 400 });
    }

    const calendarData = await calendarRes.json();
    const events = calendarData.items || [];

    let extractedCount = 0;

    // Process each event
    for (const event of events) {
      const title = event.summary || "Calendar event";
      const description = event.description || "";
      const startTime = event.start?.dateTime || event.start?.date;

      if (!startTime) continue;

      // Extract commitments from event title + description
      const eventText = `${title}${description ? ": " + description : ""}`;

      const extractRes = await fetch(
        `${new URL(request.url).origin}/api/extract`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `Calendar event: ${eventText}. Scheduled for ${new Date(startTime).toLocaleDateString()}`,
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
      total: events.length,
    });
  } catch (error) {
    console.error("Calendar sync error:", error);
    return Response.json({ error: "Failed to sync calendar" }, { status: 500 });
  }
}

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { question, authToken } = await request.json();

    if (!question || !authToken) {
      return Response.json({ error: "Missing question or auth token" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!supabaseUrl || !supabaseKey || !anthropicKey) {
      return Response.json({ error: "Config error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's memories for context
    const { data: memories, error } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: "Failed to fetch memories" }, { status: 500 });
    }

    // Build context from memories
    const memoryContext = (memories || [])
      .map(
        (m) =>
          `[Memory: "${m.title}"] Priority: ${m.priority || "none"}, Due: ${m.due_date || "no date"}, Content: ${m.content || ""}`
      )
      .join("\n");

    const systemPrompt = `You are Recall AI, a helpful memory assistant. The user has asked you a question about their memories.
    
Below are the user's memories to help answer their question:

${memoryContext}

When answering:
1. Use the memories provided to answer the question accurately
2. Reference specific memories by their titles in [square brackets]
3. Be conversational and helpful
4. If you can't find relevant memories, say so honestly
5. Provide specific details from the memories when relevant
6. Include memory IDs in your response for reference`;

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
      system: systemPrompt,
    });

    const responseText = message.content[0]?.type === "text" ? message.content[0].text : "";

    // Extract referenced memories from response
    const memoryReferences = memories?.filter((m) =>
      responseText.includes(`[Memory: "${m.title}"]`) || responseText.includes(m.title)
    ) || [];

    return Response.json({
      answer: responseText,
      references: memoryReferences.map((m) => ({
        id: m.id,
        title: m.title,
        priority: m.priority,
        dueDate: m.due_date,
        content: m.content,
      })),
      memoryCount: memories?.length || 0,
    });
  } catch (error) {
    console.error("Ask error:", error);
    return Response.json({ error: "Failed to process question" }, { status: 500 });
  }
}

import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { text, authToken } = await request.json();
    if (!text?.trim()) return Response.json({ error: "Text required" }, { status: 400 });
    if (!authToken) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const GEMINI_KEY = process.env.GOOGLE_GEMINI_API_KEY;
    if (!GEMINI_KEY) return Response.json({ error: "Config error" }, { status: 500 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return Response.json({ error: "Config error" }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user } } = await supabase.auth.getUser(authToken);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const prompt = `Extract info from: "${text}"\n\nRespond ONLY with this JSON (no markdown):\n{"title":"string (max 10 words)","type":"commitment","priority":"high","due_date":null,"people":[],"summary":"string"}`;

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const gres = await res.json();
    const txt = gres.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const extracted = JSON.parse(txt.replace(/```json|```/g, ""));

    const { data } = await supabase.from("memories").insert([{
      user_id: user.id,
      title: extracted.title || "Note",
      content: text,
      source: "manual",
      type: extracted.type || "note",
      status: "processed",
      tags: extracted.people || [],
      due_date: extracted.due_date,
      priority: extracted.priority || "medium",
      extracted_at: new Date().toISOString(),
    }]);

    return Response.json({ success: true, memory: data?.[0] });
  } catch (e) {
    console.error("Extract error:", e);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}

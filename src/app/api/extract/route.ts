import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { text, authToken } = await request.json();
    if (!text?.trim()) return Response.json({ error: "Text required" }, { status: 400 });
    if (!authToken) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const GEMINI_KEY = process.env.GOOGLE_GEMINI_API_KEY;
    console.log("GEMINI_KEY set?", !!GEMINI_KEY);
    if (!GEMINI_KEY) return Response.json({ error: "Config error - missing GOOGLE_GEMINI_API_KEY" }, { status: 500 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return Response.json({ error: "Config error" }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${authToken}` } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const prompt = `Extract info from: "${text}"\n\nRespond ONLY with this JSON (no markdown):\n{"title":"string (max 10 words)","type":"commitment","priority":"high","due_date":null,"people":[],"summary":"string"}`;

    const res = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash-lite:generateContent?key=" + GEMINI_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const gres = await res.json();
    console.log("Full Gemini response:", JSON.stringify(gres, null, 2));
    const txt = gres.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    console.log("Extracted text from Gemini:", txt);
    const extracted = JSON.parse(txt.replace(/```json|```/g, ""));
    console.log("Final extracted data:", JSON.stringify(extracted));

    const { data, error } = await supabase.from("memories").insert([{
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

    if (error) {
      console.error("Insert error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, memory: data?.[0] });
  } catch (e) {
    console.error("Extract error:", e);
    console.error("Error details:", JSON.stringify(e));
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

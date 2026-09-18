import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: Request) {
  try {
    const { text, authToken } = await request.json();

    if (!text?.trim()) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!authToken) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!GEMINI_API_KEY) {
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      data: { user },
    } = await supabase.auth.getUser(authToken);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const extractionPrompt = `You are an AI assistant that extracts structured information from user-provided text about commitments, tasks, and notes.

Extract the following from the text:
1. title: A short, clear title (max 10 words)
2. type: One of 'commitment', 'task', 'note', 'decision'
3. priority: One of 'high', 'medium', 'low' (based on language urgency/importance)
4. due_date: ISO date (YYYY-MM-DD) if mentioned, null otherwise
5. people: Array of names/entities mentioned
6. summary: 1-2 sentence summary of the key point

User text: "${text}"

Respond ONLY with valid JSON in this exact format:
{
  "title": "string",
  "type": "commitment" | "task" | "note" | "decision",
  "priority": "high" | "medium" | "low",
  "due_date": "YYYY-MM-DD" | null,
  "people": ["name1", "name2"],
  "summary": "string"
}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: extractionPrompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API error:', error);
      return Response.json(
        { error: 'Failed to extract memory' },
        { status: response.status }
      );
    }

    const geminiResponse = await response.json();
    const responseText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const extracted = JSON.parse(responseText);

    const { data, error } = await supabase.from('memories').insert([
      {
        user_id: user.id,
        title: extracted.title,
        content: text,
        source: 'manual',
        type: extracted.type,
        status: 'processed',
        tags: extracted.people || [],
        due_date: extracted.due_date,
        priority: extracted.priority,
        extracted_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Supabase error:', error);
      return Response.json({ error: 'Failed to save memory' }, { status: 500 });
    }

    return Response.json({ success: true, memory: data });
  } catch (error) {
    console.error('Extraction error:', error);
    return Response.json(
      { error: 'Failed to extract memory' },
      { status: 500 }
    );
  }
}

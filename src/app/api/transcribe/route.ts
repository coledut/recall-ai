import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as Blob;
    const authToken = formData.get('authToken') as string;

    if (!audio || !authToken) {
      return Response.json({ error: "Missing audio or auth" }, { status: 400 });
    }

    const SPEECH_KEY = process.env.GOOGLE_SPEECH_API_KEY;
    if (!SPEECH_KEY) {
      return Response.json({ error: "Config error" }, { status: 500 });
    }

    // Convert audio to base64
    const buffer = await audio.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString('base64');

    // Call Google Speech-to-Text API
    const res = await fetch("https://speech.googleapis.com/v1/speech:recognize?key=" + SPEECH_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        config: {
          encoding: "WEBM_OPUS",
          sampleRateHertz: 48000,
          languageCode: "en-US",
        },
        audio: { content: base64Audio },
      }),
    });

    const speechRes = await res.json();
    console.log("Speech API response:", JSON.stringify(speechRes, null, 2));

    const transcript = speechRes.results?.[0]?.alternatives?.[0]?.transcript || "";
    if (!transcript) {
      return Response.json({ error: "No speech detected" }, { status: 400 });
    }

    console.log("Transcribed text:", transcript);

    // Now extract using the same extraction logic
    const extractRes = await fetch(
      `${new URL(request.url).origin}/api/extract`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: transcript,
          authToken,
        }),
      }
    );

    if (extractRes.ok) {
      const extracted = await extractRes.json();
      return Response.json({ success: true, transcript, extracted });
    }

    return Response.json({ success: false, transcript });
  } catch (error) {
    console.error("Transcribe error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

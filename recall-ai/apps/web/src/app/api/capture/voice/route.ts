import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getEnv } from '@recall/config';

export const POST = async (req: NextRequest) => {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert audio to text via Deepgram STT
    const env = getEnv();
    if (!env.DEEPGRAM_API_KEY) {
      return NextResponse.json(
        { error: 'STT not configured' },
        { status: 503 }
      );
    }

    const audioBuffer = await file.arrayBuffer();

    const deepgramResponse = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        Authorization: `Token ${env.DEEPGRAM_API_KEY}`,
        'Content-Type': file.type || 'audio/webm',
      },
      body: audioBuffer,
    });

    if (!deepgramResponse.ok) {
      console.error('Deepgram error:', await deepgramResponse.text());
      return NextResponse.json(
        { error: 'Transcription failed' },
        { status: 500 }
      );
    }

    const transcription = await deepgramResponse.json();
    const text = transcription.results?.channels[0]?.alternatives[0]?.transcript;

    if (!text) {
      return NextResponse.json(
        { error: 'No speech detected' },
        { status: 400 }
      );
    }

    // Use existing extraction API
    const extractResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/memories/extract`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: req.headers.get('cookie') || '',
        },
        body: JSON.stringify({
          text,
          sourceType: 'VOICE',
        }),
      }
    );

    if (!extractResponse.ok) {
      return NextResponse.json(
        { error: 'Extraction failed' },
        { status: 500 }
      );
    }

    return extractResponse;
  } catch (error) {
    console.error('Voice capture error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice' },
      { status: 500 }
    );
  }
};

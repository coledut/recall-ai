import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getEnv } from '@recall/config';

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

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

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported' },
        { status: 400 }
      );
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large' },
        { status: 400 }
      );
    }

    // Extract text from file
    let extractedText = '';

    if (file.type.startsWith('image/')) {
      // OCR - simplified (in production, use Tesseract or similar)
      // For MVP, we'll create a placeholder that passes to extraction
      extractedText = `[Image file: ${file.name}]\nPlease describe any visible text or important information from this image.`;
    } else if (file.type === 'application/pdf') {
      // PDF text extraction - simplified for MVP
      extractedText = `[PDF document: ${file.name}]\nContent extracted from PDF. Please review for important commitments and deadlines.`;
    } else if (file.type === 'text/plain') {
      // Plain text - read directly
      extractedText = await file.text();
    } else {
      // Word docs - simplified for MVP
      extractedText = `[Document: ${file.name}]\nContent from uploaded document. Please review for important information.`;
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted' },
        { status: 400 }
      );
    }

    // Store file in Supabase Storage
    const env = getEnv();
    const fileName = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('captures')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
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
          text: extractedText,
          sourceType: 'FILE',
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
    console.error('File capture error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
};

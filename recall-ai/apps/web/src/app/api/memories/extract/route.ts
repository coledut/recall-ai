import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { AnthropicCapabilityService } from '@recall/ai';
import { getDb } from '@recall/db';
import {
  RawCaptureEventSchema,
  validateExtractedMemory,
} from '@recall/core';
import { getEnv } from '@recall/config';
import { v4 as uuidv4 } from 'uuid';
import { checkApiRateLimit } from '@/lib/rate-limit';
import { validateInput, captureTextSchema } from '@/lib/validation';

export const POST = async (req: NextRequest) => {
  try {
    // Verify user is authenticated
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit
    const allowed = await checkApiRateLimit(user.id);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = validateInput(captureTextSchema, {
      text: body.text,
      sourceType: body.sourceType,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { text, sourceType = 'QUICK_CAPTURE' } = validation.data!;

    // Create RawCaptureEvent
    const captureEvent = RawCaptureEventSchema.parse({
      userId: user.id,
      sourceType,
      externalId: `${sourceType}-${Date.now()}-${uuidv4()}`,
      occurredAt: new Date(),
      text: text.trim(),
      language: 'en',
    });

    // Initialize AI service and extract memory
    const env = getEnv();
    const aiService = new AnthropicCapabilityService(env.ANTHROPIC_API_KEY, {
      usageCallback: async (usage) => {
        // Track AI usage for cost monitoring
        const db = getDb(env.DATABASE_URL || '');
        await db.insert(db.aiUsage).values({
          userId: user.id,
          ...usage,
        });
      },
    });

    const extractionResult = await aiService.extractMemory({
      capture: captureEvent,
      targetLanguage: 'en',
    });

    // Validate and persist extracted memories
    const db = getDb(env.DATABASE_URL || '');
    const persistedMemories = [];

    for (const memory of extractionResult.memories) {
      // Validate memory before persisting
      const validationErrors = validateExtractedMemory(memory);
      if (validationErrors.some((e) => !e.startsWith('WARNING'))) {
        console.warn('Memory validation errors:', validationErrors);
        continue; // Skip invalid memories
      }

      // Insert memory record
      const memoryId = uuidv4();
      await db.insert(db.memories).values({
        id: memoryId,
        userId: user.id,
        type: memory.type,
        title: memory.title,
        summary: memory.summary,
        personRaw: memory.personName,
        dueAt: memory.dueAt ? new Date(memory.dueAt) : null,
        status: 'DETECTED',
        importance: memory.importance || 'MEDIUM',
        confidence: memory.confidence,
        language: 'en',
        sourceType: captureEvent.sourceType,
        sourceRef: captureEvent.externalId,
        sourceExcerpt: captureEvent.text.slice(0, 5000),
        dedupeHash: `${memory.title}-${memory.type}`,
      });

      persistedMemories.push({
        id: memoryId,
        ...memory,
      });
    }

    return NextResponse.json({
      success: true,
      memoriesCreated: persistedMemories.length,
      memories: persistedMemories,
    });
  } catch (error) {
    console.error('Error extracting memory:', error);
    return NextResponse.json(
      { error: 'Failed to extract memory' },
      { status: 500 }
    );
  }
};

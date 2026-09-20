import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getDb, memories as memoriesTable } from '@recall/db';
import { AnthropicCapabilityService } from '@recall/ai';
import { getEnv } from '@recall/config';
import { eq, ilike, sql } from 'drizzle-orm';
import { validateInput, querySchema } from '@/lib/validation';
import { checkApiRateLimit } from '@/lib/rate-limit';

export interface AskRecallRequest {
  question: string;
}

export interface AskRecallResponse {
  answer: string;
  sources: Array<{
    memoryId: string;
    excerpt: string;
  }>;
  confidence: number;
  followUp?: string; // Suggested follow-up question
}

export const POST = async (req: NextRequest) => {
  try {
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

    const body = (await req.json()) as AskRecallRequest;
    const validation = validateInput(querySchema, {
      query: body.question,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { query: question } = validation.data!;

    const env = getEnv();
    const db = getDb(env.DATABASE_URL || '');

    // Retrieve relevant memories using hybrid search
    const retrievedMemories = await retrieveMemories(
      db,
      user.id,
      question
    );

    if (retrievedMemories.length === 0) {
      return NextResponse.json({
        answer:
          "I don't have any relevant memories to answer that question. Try asking about specific people, deadlines, or commitments.",
        sources: [],
        confidence: 0,
      } as AskRecallResponse);
    }

    // Use AI to answer the question with retrieved context
    const aiService = new AnthropicCapabilityService(env.ANTHROPIC_API_KEY, {
      usageCallback: async (usage) => {
        await db.insert(db.aiUsage).values({
          userId: user.id,
          ...usage,
        });
      },
    });

    const answerResult = await aiService.answerMemoryQuery({
      query: question,
      retrievedMemories: retrievedMemories.map((m) => ({
        id: m.id,
        type: m.type,
        title: m.title,
        summary: m.summary,
        excerpt: m.sourceExcerpt,
      })),
      targetLanguage: 'en',
    });

    // Map cited memory IDs to source excerpts
    const sources = answerResult.citedMemoryIds.map((id) => {
      const memory = retrievedMemories.find((m) => m.id === id);
      return {
        memoryId: id,
        excerpt: memory?.sourceExcerpt || memory?.summary || '',
      };
    });

    return NextResponse.json({
      answer: answerResult.answer,
      sources,
      confidence: answerResult.confidence,
    } as AskRecallResponse);
  } catch (error) {
    console.error('Ask Recall error:', error);
    return NextResponse.json(
      { error: 'Failed to answer question' },
      { status: 500 }
    );
  }
};

async function retrieveMemories(
  db: any,
  userId: string,
  question: string
) {
  // Hybrid retrieval: full-text + keyword matching
  const keywords = question
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => w.toLowerCase());

  // Full-text search
  const tsQuery = keywords.join(' & ');

  const results = await db
    .select()
    .from(memoriesTable)
    .where(
      eq(memoriesTable.userId, userId) &&
        sql`to_tsvector('english', ${memoriesTable.title} || ' ' || ${memoriesTable.summary}) @@ to_tsquery('english', ${tsQuery})`
    )
    .limit(10);

  // If no full-text results, fall back to keyword matching
  if (results.length === 0) {
    const keywordQueries = keywords.map((k) =>
      ilike(memoriesTable.title, `%${k}%`)
    );

    return await db
      .select()
      .from(memoriesTable)
      .where(eq(memoriesTable.userId, userId))
      .limit(10);
  }

  return results;
}

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getDb, memories as memoriesTable } from '@recall/db';
import { getEnv } from '@recall/config';
import { eq, sql, ilike } from 'drizzle-orm';
import type { Memory } from '@/lib/types';

export interface SearchQuery {
  q: string;
}

export interface SearchResult {
  memory: Memory;
  score: number;
  reason: string; // why this memory matched
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

    const body = (await req.json()) as SearchQuery;
    const { q } = body;

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const env = getEnv();
    const db = getDb(env.DATABASE_URL || '');

    // Hybrid retrieval strategy per spec section 35:
    // 1. Structured filters (parsed from query)
    // 2. Full-text search (tsvector)
    // 3. Semantic similarity (pgvector) - optional in MVP

    // Parse simple filters from query (e.g., "from Ahmed" -> filter by person)
    const queryLower = q.toLowerCase();
    const personMatch = q.match(/(?:from|by)\s+(\w+)/i);
    const typeMatch = q.match(/\b(commitment|follow[- ]up|deadline|waiting|decision|task|fact)\b/i);

    const results: SearchResult[] = [];

    // Strategy 1: Full-text search on title + summary
    try {
      const tsQuery = q
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .join(' & ');

      const fullTextResults = await db
        .select()
        .from(memoriesTable)
        .where(
          eq(memoriesTable.userId, user.id) &&
            sql`to_tsvector('english', ${memoriesTable.title} || ' ' || ${memoriesTable.summary}) @@ to_tsquery('english', ${tsQuery})`
        )
        .limit(10);

      for (const memory of fullTextResults) {
        results.push({
          memory: memory as any,
          score: 0.8, // High confidence for full-text match
          reason: 'Keyword match in title or summary',
        });
      }
    } catch (err) {
      console.error('Full-text search error:', err);
    }

    // Strategy 2: Case-insensitive substring match (when full-text fails)
    if (results.length < 5) {
      const substringResults = await db
        .select()
        .from(memoriesTable)
        .where(
          eq(memoriesTable.userId, user.id) &&
            (ilike(memoriesTable.title, `%${q}%`) ||
              ilike(memoriesTable.summary, `%${q}%`))
        )
        .limit(10 - results.length);

      for (const memory of substringResults) {
        // Avoid duplicates
        if (!results.some((r) => r.memory.id === memory.id)) {
          results.push({
            memory: memory as any,
            score: 0.7,
            reason: 'Text match in title or summary',
          });
        }
      }
    }

    // Strategy 3: Structured filters (person, type)
    if (results.length < 5 && personMatch) {
      const person = personMatch[1];
      const personResults = await db
        .select()
        .from(memoriesTable)
        .where(
          eq(memoriesTable.userId, user.id) &&
            ilike(memoriesTable.personRaw, `%${person}%`)
        )
        .limit(10 - results.length);

      for (const memory of personResults) {
        if (!results.some((r) => r.memory.id === memory.id)) {
          results.push({
            memory: memory as any,
            score: 0.6,
            reason: `Associated with ${person}`,
          });
        }
      }
    }

    // Strategy 4: Type filter (if query mentions a type)
    if (results.length < 5 && typeMatch) {
      const typeMap: Record<string, string> = {
        commitment: 'COMMITMENT',
        'follow-up': 'FOLLOW_UP',
        'follow up': 'FOLLOW_UP',
        deadline: 'DEADLINE',
        waiting: 'WAITING_FOR',
        decision: 'DECISION',
        task: 'TASK',
        fact: 'IMPORTANT_FACT',
      };

      const typeQuery = typeMap[typeMatch[1].toLowerCase()];
      if (typeQuery) {
        const typeResults = await db
          .select()
          .from(memoriesTable)
          .where(
            eq(memoriesTable.userId, user.id) &&
              eq(memoriesTable.type as any, typeQuery)
          )
          .limit(10 - results.length);

        for (const memory of typeResults) {
          if (!results.some((r) => r.memory.id === memory.id)) {
            results.push({
              memory: memory as any,
              score: 0.5,
              reason: `Type: ${typeQuery.replace('_', ' ')}`,
            });
          }
        }
      }
    }

    // Sort by score descending, limit to top 10
    const sorted = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      query: q,
      results: sorted,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search memories' },
      { status: 500 }
    );
  }
};

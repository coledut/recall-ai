import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getDb, memories as memoriesTable } from '@recall/db';
import { eq, desc } from 'drizzle-orm';
import { getEnv } from '@recall/config';

export const GET = async (req: NextRequest) => {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const env = getEnv();
    const db = getDb(env.DATABASE_URL || '');

    // Fetch user's memories, ordered by due date (null last), then by created date
    const userMemories = await db
      .select()
      .from(memoriesTable)
      .where(eq(memoriesTable.userId, user.id))
      .orderBy(
        memoriesTable.dueAt ? undefined : desc(memoriesTable.createdAt)
      );

    return NextResponse.json({
      success: true,
      memories: userMemories,
    });
  } catch (error) {
    console.error('Error fetching memories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memories' },
      { status: 500 }
    );
  }
};

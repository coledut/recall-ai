import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getDb, memories as memoriesTable } from '@recall/db';
import { eq, and } from 'drizzle-orm';
import { transitionMemoryStatus } from '@recall/core';
import { getEnv } from '@recall/config';
import { validateInput, memoryActionSchema } from '@/lib/validation';
import { checkApiRateLimit } from '@/lib/rate-limit';

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
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

    // Validate input
    const body = await req.json();
    const validation = validateInput(memoryActionSchema, {
      id: params.id,
      action: body.action,
      snoozeUntil: body.snoozeUntil,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { action } = validation.data!;

    const env = getEnv();
    const db = getDb(env.DATABASE_URL || '');

    // Get the memory to verify ownership and current status
    const memory = await db
      .select()
      .from(memoriesTable)
      .where(
        and(
          eq(memoriesTable.id, params.id),
          eq(memoriesTable.userId, user.id)
        )
      )
      .limit(1);

    if (!memory || memory.length === 0) {
      return NextResponse.json(
        { error: 'Memory not found' },
        { status: 404 }
      );
    }

    const current = memory[0];

    // Map UI action to status transition
    let newStatus = current.status;
    const timestamp = new Date();

    switch (action) {
      case 'complete':
        newStatus = 'COMPLETED';
        break;
      case 'snooze':
        newStatus = 'SNOOZED';
        // Snooze for 1 day
        break;
      case 'dismiss':
        newStatus = 'DISMISSED';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Validate state transition
    const transitionAction = action as 'complete' | 'snooze' | 'dismiss';
    const validNewStatus = transitionMemoryStatus(current.status, transitionAction);

    if (!validNewStatus) {
      return NextResponse.json(
        { error: `Cannot ${action} a memory in ${current.status} status` },
        { status: 400 }
      );
    }

    // Update memory
    const updateData: any = { status: newStatus, updatedAt: timestamp };

    if (action === 'complete') {
      updateData.completedAt = timestamp;
    } else if (action === 'snooze') {
      const snoozedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      updateData.snoozedUntil = snoozedUntil;
    } else if (action === 'dismiss') {
      updateData.dismissedAt = timestamp;
    }

    await db
      .update(memoriesTable)
      .set(updateData)
      .where(eq(memoriesTable.id, params.id));

    return NextResponse.json({
      success: true,
      memory: { ...current, ...updateData },
    });
  } catch (error) {
    console.error('Error updating memory:', error);
    return NextResponse.json(
      { error: 'Failed to update memory' },
      { status: 500 }
    );
  }
};

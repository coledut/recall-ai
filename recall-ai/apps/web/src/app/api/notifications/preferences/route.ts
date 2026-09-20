import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { db } from '@recall/db';
import { notificationPreferences } from '@recall/db/schema';
import { eq } from 'drizzle-orm';

export const GET = async (req: NextRequest) => {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prefs = await db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, user.id),
    });

    return NextResponse.json(
      prefs || {
        emailDigestFrequency: 'daily',
        pushNotificationsEnabled: true,
        quietHourStart: null,
        quietHourEnd: null,
      }
    );
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
};

export const PATCH = async (req: NextRequest) => {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { emailDigestFrequency, pushNotificationsEnabled, quietHourStart, quietHourEnd } = body;

    // Validate quiet hours format (HH:mm)
    if (quietHourStart && !/^\d{2}:\d{2}$/.test(quietHourStart)) {
      return NextResponse.json(
        { error: 'Invalid quiet hour start format (use HH:mm)' },
        { status: 400 }
      );
    }
    if (quietHourEnd && !/^\d{2}:\d{2}$/.test(quietHourEnd)) {
      return NextResponse.json(
        { error: 'Invalid quiet hour end format (use HH:mm)' },
        { status: 400 }
      );
    }

    // Upsert preferences
    const existing = await db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, user.id),
    });

    if (existing) {
      await db
        .update(notificationPreferences)
        .set({
          emailDigestFrequency: emailDigestFrequency || existing.emailDigestFrequency,
          pushNotificationsEnabled:
            pushNotificationsEnabled !== undefined
              ? pushNotificationsEnabled
              : existing.pushNotificationsEnabled,
          quietHourStart: quietHourStart !== undefined ? quietHourStart : existing.quietHourStart,
          quietHourEnd: quietHourEnd !== undefined ? quietHourEnd : existing.quietHourEnd,
          updatedAt: new Date(),
        })
        .where(eq(notificationPreferences.userId, user.id));
    } else {
      await db.insert(notificationPreferences).values({
        userId: user.id,
        emailDigestFrequency: emailDigestFrequency || 'daily',
        pushNotificationsEnabled: pushNotificationsEnabled !== false,
        quietHourStart,
        quietHourEnd,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
};

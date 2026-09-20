import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getDb, oauthConnections } from '@recall/db';
import { getEnv } from '@recall/config';
import { eq } from 'drizzle-orm';
import { google } from 'googleapis';

export const GET = async (req: NextRequest) => {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb(getEnv().DATABASE_URL || '');
    const userConnections = await db
      .select()
      .from(oauthConnections)
      .where(eq(oauthConnections.userId, user.id));

    // Return sanitized connections (no tokens)
    const safe = userConnections.map((conn) => ({
      id: conn.id,
      provider: conn.provider,
      status: conn.status,
      connectedAt: conn.connectedAt,
      expiresAt: conn.expiresAt,
    }));

    return NextResponse.json({ connections: safe });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, provider } = body;

    if (action === 'connect') {
      // Generate OAuth URL for Google
      if (provider === 'google') {
        const oauth2Client = new google.auth.OAuth2(
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/google/callback`
        );

        const authUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/calendar.readonly',
          ],
        });

        return NextResponse.json({ authUrl });
      }
    } else if (action === 'disconnect') {
      const db = getDb(getEnv().DATABASE_URL || '');

      // Mark connection as revoked
      await db
        .update(oauthConnections)
        .set({
          status: 'revoked',
          revokedAt: new Date(),
        })
        .where(
          eq(oauthConnections.userId, user.id) &&
            eq(oauthConnections.provider, provider)
        );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error managing connection:', error);
    return NextResponse.json(
      { error: 'Failed to manage connection' },
      { status: 500 }
    );
  }
};

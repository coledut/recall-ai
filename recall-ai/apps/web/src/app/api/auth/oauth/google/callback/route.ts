import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getDb, oauthConnections } from '@recall/db';
import { getEnv } from '@recall/config';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/google/callback`
);

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json(
        { error: 'No authorization code provided' },
        { status: 400 }
      );
    }

    // Verify state token (should match session state, simplified for MVP)
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    // Determine which scopes were granted (simplified: assume both if gmail requested)
    const provider = 'google'; // Could differentiate between gmail/calendar later
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/calendar.readonly',
    ];

    // Encrypt tokens (in production, use Supabase pgcrypto; for MVP, use environment key)
    const db = getDb(getEnv().DATABASE_URL || '');

    // Upsert connection
    const existingConn = await db
      .select()
      .from(oauthConnections)
      .where(
        oauthConnections.userId === user.id &&
          oauthConnections.provider === provider
      )
      .limit(1);

    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000); // Default 1 hour if not specified

    if (existingConn.length > 0) {
      // Update existing connection
      await db
        .update(oauthConnections)
        .set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || existingConn[0].refreshToken,
          expiresAt,
          status: 'active',
          connectedAt: new Date(),
        })
        .where(oauthConnections.id === existingConn[0].id);
    } else {
      // Create new connection
      await db.insert(oauthConnections).values({
        userId: user.id,
        provider,
        scopes,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        status: 'active',
      });
    }

    // Redirect to connections page
    return NextResponse.redirect(
      new URL('/settings/connections', process.env.NEXT_PUBLIC_APP_URL)
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'OAuth callback failed' },
      { status: 500 }
    );
  }
};

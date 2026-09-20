import { TaskHandler } from 'graphile-worker';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import { getDb, oauthConnections } from '@recall/db';
import {
  convertCalendarEventToCapture,
  buildCalendarTimeRange,
} from '@recall/capture';
import { AnthropicCapabilityService } from '@recall/ai';
import { validateExtractedMemory, scoreCapture } from '@recall/core';
import { Env } from '@recall/config';
import { eq } from 'drizzle-orm';

export interface CalendarIngestPayload {
  userId: string;
}

export const registerCalendarIngestJob =
  (env: Env): TaskHandler =>
  async (payload: any) => {
    const { userId } = payload as CalendarIngestPayload;

    console.log(`[Calendar] Starting ingestion for user ${userId}`);

    try {
      const db = getDb(env.DATABASE_URL || '');
      const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Get user's Google Calendar OAuth connection
      const connection = await db
        .select()
        .from(oauthConnections)
        .where(
          eq(oauthConnections.userId, userId) &&
            eq(oauthConnections.provider, 'google')
        )
        .limit(1);

      if (!connection || connection.length === 0) {
        console.log(`[Calendar] No Google Calendar connection found for user ${userId}`);
        return;
      }

      const oauth = connection[0];

      // Check if token is still valid
      if (oauth.status !== 'active' || (oauth.expiresAt && new Date(oauth.expiresAt) < new Date())) {
        console.log(`[Calendar] Token expired or revoked for user ${userId}`);
        return;
      }

      // Initialize Calendar API client
      const calendar = google.calendar({ version: 'v3' });

      // Fetch events from last 7 days
      const timeRange = buildCalendarTimeRange({
        afterDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      });

      console.log(
        `[Calendar] Fetching events for user ${userId} from ${timeRange.timeMin}`
      );

      const listResponse = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeRange.timeMin,
        timeMax: timeRange.timeMax,
        maxResults: 100,
        auth: oauth.accessToken,
      });

      const events = listResponse.data.items || [];
      console.log(`[Calendar] Found ${events.length} events for user ${userId}`);

      const aiService = new AnthropicCapabilityService(env.ANTHROPIC_API_KEY, {
        usageCallback: async (usage) => {
          await db.insert(db.aiUsage).values({
            userId,
            ...usage,
          });
        },
      });

      // Process each event
      let extractedCount = 0;
      for (const event of events) {
        if (!event.id) continue;

        try {
          // Convert to RawCaptureEvent
          const captureEvent = convertCalendarEventToCapture(userId, event);
          if (!captureEvent) continue;

          // Score the capture (all-day meetings or very short events might be filtered)
          const score = scoreCapture(captureEvent);
          if (!score.shouldProcess) {
            console.log(`[Calendar] Skipping event ${event.id} (score: ${score.score})`);
            continue;
          }

          // Extract memories using AI
          const extractionResult = await aiService.extractMemory({
            capture: captureEvent,
            targetLanguage: 'en',
          });

          // Persist extracted memories
          for (const memory of extractionResult.memories) {
            const validationErrors = validateExtractedMemory(memory);
            if (validationErrors.some((e) => !e.startsWith('WARNING'))) {
              console.warn(`[Calendar] Skipping invalid memory:`, validationErrors);
              continue;
            }

            const memoryId = crypto.randomUUID?.() || `mem-${Date.now()}-${Math.random()}`;
            await db.insert(db.memories).values({
              id: memoryId,
              userId,
              type: memory.type,
              title: memory.title,
              summary: memory.summary,
              personRaw: memory.personName,
              dueAt: memory.dueAt ? new Date(memory.dueAt) : null,
              status: 'DETECTED',
              importance: memory.importance || 'MEDIUM',
              confidence: memory.confidence,
              language: 'en',
              sourceType: 'CALENDAR',
              sourceRef: event.id,
              sourceExcerpt: captureEvent.text.slice(0, 5000),
              dedupeHash: `${memory.title}-${memory.type}`,
              createdAt: new Date(),
              updatedAt: new Date(),
              extractedAt: new Date(),
              detectedAt: new Date(),
            });

            extractedCount++;
          }
        } catch (err) {
          console.error(`[Calendar] Error processing event ${event.id}:`, err);
        }
      }

      console.log(`[Calendar] Ingestion complete for user ${userId}: extracted ${extractedCount} memories`);
    } catch (error) {
      console.error(`[Calendar] Job error for user ${userId}:`, error);
      throw error;
    }
  };

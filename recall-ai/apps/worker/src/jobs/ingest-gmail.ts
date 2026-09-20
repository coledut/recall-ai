import { TaskHandler } from 'graphile-worker';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import { getDb, oauthConnections } from '@recall/db';
import {
  convertGmailMessageToCapture,
  buildGmailQuery,
} from '@recall/capture';
import { AnthropicCapabilityService } from '@recall/ai';
import { validateExtractedMemory, scoreCapture } from '@recall/core';
import { Env } from '@recall/config';
import { eq } from 'drizzle-orm';

export interface GmailIngestPayload {
  userId: string;
}

export const registerGmailIngestJob =
  (env: Env): TaskHandler =>
  async (payload: any) => {
    const { userId } = payload as GmailIngestPayload;

    console.log(`[Gmail] Starting ingestion for user ${userId}`);

    try {
      const db = getDb(env.DATABASE_URL || '');
      const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Get user's Gmail OAuth connection
      const connection = await db
        .select()
        .from(oauthConnections)
        .where(
          eq(oauthConnections.userId, userId) &&
            eq(oauthConnections.provider, 'google')
        )
        .limit(1);

      if (!connection || connection.length === 0) {
        console.log(`[Gmail] No Gmail connection found for user ${userId}`);
        return;
      }

      const oauth = connection[0];

      // Check if token is still valid; if expired, skip (user needs to reconnect)
      if (oauth.status !== 'active' || (oauth.expiresAt && new Date(oauth.expiresAt) < new Date())) {
        console.log(`[Gmail] Token expired or revoked for user ${userId}`);
        return;
      }

      // Initialize Gmail API client
      const gmail = google.gmail({ version: 'v1' });

      // Fetch recent emails (last 7 days)
      const afterDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const query = buildGmailQuery({ afterDate, maxResults: 50 });

      console.log(`[Gmail] Fetching messages for user ${userId} with query: ${query}`);

      const listResponse = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 50,
        auth: oauth.accessToken, // TODO: use refresh token if expired
      });

      const messageIds = listResponse.data.messages || [];
      console.log(`[Gmail] Found ${messageIds.length} messages for user ${userId}`);

      const aiService = new AnthropicCapabilityService(env.ANTHROPIC_API_KEY, {
        usageCallback: async (usage) => {
          await db.insert(db.aiUsage).values({
            userId,
            ...usage,
          });
        },
      });

      // Process each message
      let extractedCount = 0;
      for (const msg of messageIds) {
        if (!msg.id) continue;

        try {
          // Fetch full message
          const fullMessage = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            auth: oauth.accessToken,
          });

          // Convert to RawCaptureEvent
          const captureEvent = convertGmailMessageToCapture(
            userId,
            fullMessage.data
          );
          if (!captureEvent) continue;

          // Score the capture (pre-filter cheap)
          const score = scoreCapture(captureEvent);
          if (!score.shouldProcess) {
            console.log(`[Gmail] Skipping message ${msg.id} (score: ${score.score})`);
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
              console.warn(`[Gmail] Skipping invalid memory:`, validationErrors);
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
              sourceType: 'GMAIL',
              sourceRef: msg.id,
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
          console.error(`[Gmail] Error processing message ${msg.id}:`, err);
          // Continue to next message instead of failing the job
        }
      }

      console.log(`[Gmail] Ingestion complete for user ${userId}: extracted ${extractedCount} memories`);
    } catch (error) {
      console.error(`[Gmail] Job error for user ${userId}:`, error);
      throw error; // graphile-worker will retry
    }
  };

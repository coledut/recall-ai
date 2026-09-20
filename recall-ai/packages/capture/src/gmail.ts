import { gmail_v1 } from 'googleapis';
import { RawCaptureEvent } from '@recall/core';

/**
 * Convert Gmail message to RawCaptureEvent
 * Per spec section 7: Universal Capture principle
 * No Gmail-specific logic in Memory Engine; all normalization happens here
 */
export const convertGmailMessageToCapture = (
  userId: string,
  message: gmail_v1.Schema$Message
): RawCaptureEvent | null => {
  if (!message.id || !message.internalDate) {
    return null;
  }

  const headers = message.payload?.headers || [];
  const fromHeader = headers.find((h) => h.name === 'From');
  const subjectHeader = headers.find((h) => h.name === 'Subject');
  const toHeader = headers.find((h) => h.name === 'To');

  const subject = subjectHeader?.value || '(no subject)';
  const from = fromHeader?.value || '(unknown sender)';

  // Extract text body (prefer plain text over HTML)
  const body = extractBodyText(message.payload);
  const fullText = `Subject: ${subject}\nFrom: ${from}\n\n${body}`;

  // Parse recipients
  const toEmails = toHeader?.value?.split(',').map((e) => e.trim()) || [];
  const participants = [
    { name: from.split('<')[0]?.trim() || from, email: extractEmail(from) },
    ...toEmails.map((email) => ({
      name: email.split('<')[0]?.trim() || email,
      email: extractEmail(email),
    })),
  ].filter((p) => p.email);

  const internalDate = parseInt(message.internalDate || Date.now().toString());

  return {
    userId,
    sourceType: 'GMAIL',
    externalId: message.id,
    occurredAt: new Date(internalDate),
    text: fullText,
    language: 'en', // TODO: detect language
    participants,
    threadId: message.threadId,
    rawMetadata: {
      messageId: message.id,
      threadId: message.threadId,
      labels: message.labelIds || [],
      snippet: message.snippet,
    },
  };
};

function extractBodyText(payload?: gmail_v1.Schema$MessagePart): string {
  if (!payload) return '';

  // Check plain text first
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }

  // Recursively search for text/plain in parts
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
    // Fallback to first part with data
    for (const part of payload.parts) {
      if (part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
  }

  return '';
}

function extractEmail(addressString: string): string | undefined {
  const match = addressString.match(/<(.+?)>/);
  return match ? match[1] : addressString.trim();
}

export interface GmailIngestOptions {
  maxResults?: number;
  afterDate?: Date;
  query?: string;
}

export const buildGmailQuery = (options: GmailIngestOptions): string => {
  const parts: string[] = [];

  if (options.afterDate) {
    const afterTimestamp = Math.floor(options.afterDate.getTime() / 1000);
    parts.push(`after:${afterTimestamp}`);
  }

  if (options.query) {
    parts.push(options.query);
  }

  // Exclude common non-actionable emails
  parts.push('-label:promotions');
  parts.push('-label:updates');

  return parts.join(' ');
};

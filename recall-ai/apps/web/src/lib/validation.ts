import { z } from 'zod';

// Auth
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1).max(100).optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

// Capture
export const captureTextSchema = z.object({
  text: z.string().min(1, 'Text required').max(10000, 'Text too long'),
  sourceType: z.enum(['QUICK_CAPTURE', 'VOICE', 'FILE']).optional(),
});

export const voiceTranscriptSchema = z.object({
  transcript: z.string().min(1, 'Transcript required').max(10000),
});

export const fileUploadSchema = z.object({
  mimeType: z.string(),
  size: z.number().max(10 * 1024 * 1024, 'File too large'),
});

// Memory actions
export const memoryActionSchema = z.object({
  id: z.string().uuid('Invalid memory ID'),
  action: z.enum(['complete', 'snooze', 'dismiss', 'reopen']),
  snoozeUntil: z.string().datetime().optional(),
});

// Query
export const querySchema = z.object({
  query: z.string().min(1, 'Query required').max(500, 'Query too long'),
  limit: z.number().min(1).max(50).default(10),
  filters: z
    .object({
      type: z.array(z.string()).optional(),
      person: z.string().optional(),
      status: z.array(z.string()).optional(),
    })
    .optional(),
});

// Notification preferences
export const notificationPrefsSchema = z.object({
  emailDigestFrequency: z.enum(['daily', 'weekly', 'off']).optional(),
  pushNotificationsEnabled: z.boolean().optional(),
  quietHourStart: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional().nullable(),
  quietHourEnd: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional().nullable(),
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url('Invalid endpoint URL'),
  keys: z.object({
    auth: z.string().min(1),
    p256dh: z.string().min(1),
  }),
});

// Validation helper
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { valid: boolean; data?: T; error?: string } {
  try {
    const parsed = schema.parse(data);
    return { valid: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Validation failed',
      };
    }
    return { valid: false, error: 'Unknown validation error' };
  }
}

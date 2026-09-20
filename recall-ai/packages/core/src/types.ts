import { z } from 'zod';

// Memory types - controlled taxonomy per spec section 10
export const MemoryTypeSchema = z.enum([
  'COMMITMENT',
  'FOLLOW_UP',
  'DEADLINE',
  'WAITING_FOR',
  'DECISION',
  'TASK',
  'IMPORTANT_FACT',
]);
export type MemoryType = z.infer<typeof MemoryTypeSchema>;

// Memory status lifecycle - per spec section 13
export const MemoryStatusSchema = z.enum([
  'DETECTED',
  'OPEN',
  'DUE_SOON',
  'DUE',
  'OVERDUE',
  'COMPLETED',
  'DISMISSED',
  'SNOOZED',
  'ARCHIVED',
  'CANCELLED',
]);
export type MemoryStatus = z.infer<typeof MemoryStatusSchema>;

// Source types that can produce captures
export const SourceTypeSchema = z.enum([
  'GMAIL',
  'CALENDAR',
  'QUICK_CAPTURE',
  'VOICE',
  'FILE',
  'IMAGE',
  'FORWARD',
]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

// Universal Capture contract - the canonical event shape
// Per spec section 6: every source adapter converts to this
export const RawCaptureEventSchema = z.object({
  userId: z.string().uuid(),
  sourceType: SourceTypeSchema,
  externalId: z.string().min(1),
  occurredAt: z.date().or(z.string().datetime()),
  text: z.string(),
  language: z.string().optional(), // ISO 639-1 code, auto-detected
  attachments: z
    .array(
      z.object({
        name: z.string(),
        mimeType: z.string(),
        url: z.string(),
        size: z.number(),
      })
    )
    .optional(),
  participants: z
    .array(
      z.object({
        name: z.string(),
        email: z.string().email().optional(),
      })
    )
    .optional(),
  threadId: z.string().optional(), // For email threads, conversation chains
  rawMetadata: z.record(z.any()).optional(), // Source-specific metadata, never touches core logic
});
export type RawCaptureEvent = z.infer<typeof RawCaptureEventSchema>;

// Extracted memory structure - what the AI produces after extraction
// This is validated against a zod schema before being persisted
export const ExtractedMemorySchema = z.object({
  type: MemoryTypeSchema,
  title: z.string().min(1).max(255),
  summary: z.string().max(2000),
  personName: z.string().optional(),
  personEmail: z.string().email().optional(),
  dueAt: z.date().or(z.string().datetime()).optional(),
  importance: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  confidence: z.number().min(0).max(1),
  actionableStatements: z.array(z.string()).optional(),
});
export type ExtractedMemory = z.infer<typeof ExtractedMemorySchema>;

// Provenance tracking - every AI-created memory must retain this
export const ProvenanceSchema = z.object({
  sourceType: SourceTypeSchema,
  sourceExcerpt: z.string().max(5000), // Original text/evidence
  sourceUrl: z.string().url().optional(),
  sourceDate: z.date().or(z.string().datetime()),
  extractedAt: z.date().or(z.string().datetime()),
  extractionConfidence: z.number().min(0).max(1),
});
export type Provenance = z.infer<typeof ProvenanceSchema>;

// AI Capability Service contracts - per spec section 23
// These define the interface between the application and the AI provider

export const ExtractMemoryCapabilityRequestSchema = z.object({
  capture: RawCaptureEventSchema,
  targetLanguage: z.string().optional(), // Language to respond in, independent of source
});
export type ExtractMemoryCapabilityRequest = z.infer<
  typeof ExtractMemoryCapabilityRequestSchema
>;

export const ExtractMemoryCapabilityResponseSchema = z.object({
  memories: z.array(ExtractedMemorySchema),
  provenance: ProvenanceSchema,
  rawOutput: z.string(), // For debugging/auditing
});
export type ExtractMemoryCapabilityResponse = z.infer<
  typeof ExtractMemoryCapabilityResponseSchema
>;

// Answer query capability - for Ask Recall feature
export const AnswerMemoryQueryCapabilityRequestSchema = z.object({
  query: z.string().min(1),
  retrievedMemories: z.array(
    z.object({
      id: z.string(),
      type: MemoryTypeSchema,
      title: z.string(),
      summary: z.string(),
      excerpt: z.string(), // Source evidence
    })
  ),
  targetLanguage: z.string().optional(),
});
export type AnswerMemoryQueryCapabilityRequest = z.infer<
  typeof AnswerMemoryQueryCapabilityRequestSchema
>;

export const AnswerMemoryQueryCapabilityResponseSchema = z.object({
  answer: z.string(),
  citedMemoryIds: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  sources: z.array(
    z.object({
      memoryId: z.string(),
      excerpt: z.string(),
    })
  ),
});
export type AnswerMemoryQueryCapabilityResponse = z.infer<
  typeof AnswerMemoryQueryCapabilityResponseSchema
>;

// Language types
export const SupportedLocaleSchema = z.enum(['en-IN', 'hi-IN', 'ar-SA']);
export type SupportedLocale = z.infer<typeof SupportedLocaleSchema>;

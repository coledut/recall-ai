import { MemoryStatus, ExtractedMemory, Provenance } from './types';

// Memory lifecycle state machine - per spec section 13
export const transitionMemoryStatus = (
  currentStatus: MemoryStatus,
  action: 'open' | 'due_soon' | 'due' | 'overdue' | 'complete' | 'dismiss' | 'snooze' | 'archive' | 'cancel'
): MemoryStatus | null => {
  const transitions: Record<MemoryStatus, Record<string, MemoryStatus>> = {
    DETECTED: {
      open: 'OPEN',
      dismiss: 'DISMISSED',
      cancel: 'CANCELLED',
    },
    OPEN: {
      due_soon: 'DUE_SOON',
      dismiss: 'DISMISSED',
      snooze: 'SNOOZED',
      archive: 'ARCHIVED',
      cancel: 'CANCELLED',
    },
    DUE_SOON: {
      due: 'DUE',
      dismiss: 'DISMISSED',
      snooze: 'SNOOZED',
      complete: 'COMPLETED',
    },
    DUE: {
      overdue: 'OVERDUE',
      complete: 'COMPLETED',
      dismiss: 'DISMISSED',
      snooze: 'SNOOZED',
    },
    OVERDUE: {
      complete: 'COMPLETED',
      dismiss: 'DISMISSED',
      snooze: 'SNOOZED',
    },
    COMPLETED: {
      archive: 'ARCHIVED',
      cancel: 'CANCELLED',
    },
    DISMISSED: {
      archive: 'ARCHIVED',
      cancel: 'CANCELLED',
    },
    SNOOZED: {
      open: 'OPEN',
      dismiss: 'DISMISSED',
      cancel: 'CANCELLED',
    },
    ARCHIVED: {},
    CANCELLED: {},
  };

  return transitions[currentStatus]?.[action] ?? null;
};

// Deduplication scoring
export interface DedupCandidate {
  existingMemoryId: string;
  similarity: number; // 0-1
  reasons: string[]; // Why we think these are the same
}

export const calculateDedupScore = (
  newMemory: ExtractedMemory,
  existingTitle: string,
  existingType: string,
  existingSummary: string,
  existingPerson?: string
): number => {
  let score = 0;

  // Type match (strong signal)
  if (newMemory.type === existingType) {
    score += 0.3;
  }

  // Person match (strong signal if both have the same person)
  if (newMemory.personName && existingPerson && newMemory.personName.toLowerCase().includes(existingPerson.toLowerCase())) {
    score += 0.25;
  }

  // Title substring overlap (moderate signal)
  const titleWords = new Set(existingTitle.toLowerCase().split(/\s+/));
  const newWords = new Set((newMemory.title || '').toLowerCase().split(/\s+/));
  const overlap = [...titleWords].filter((w) => newWords.has(w)).length;
  if (overlap > 0) {
    score += Math.min(0.25, overlap / Math.max(titleWords.size, newWords.size) * 0.5);
  }

  // Due date proximity (if both have dates)
  if (newMemory.dueAt && existingTitle) {
    // This is a simplified check; a real implementation would parse existing dates
    score += 0.1;
  }

  return Math.min(1, score);
};

// Conservative merge strategy
export const shouldMergeMemories = (dedupScore: number): boolean => {
  // Only merge if confidence is very high - ambiguous merges are conservative per spec
  return dedupScore >= 0.7;
};

// Memory validation rules
export const validateExtractedMemory = (memory: ExtractedMemory): string[] => {
  const errors: string[] = [];

  if (!memory.title || memory.title.trim().length === 0) {
    errors.push('Memory title is required and cannot be empty');
  }

  if (memory.confidence < 0 || memory.confidence > 1) {
    errors.push('Confidence must be between 0 and 1');
  }

  // Low-confidence memories should be flagged for review
  if (memory.confidence < 0.5) {
    errors.push(
      'WARNING: Low confidence memory - should be surfaced differently or require user confirmation'
    );
  }

  // Type-specific validation
  if (memory.type === 'DEADLINE' && !memory.dueAt) {
    errors.push('DEADLINE memories must have a due date');
  }

  if (memory.type === 'WAITING_FOR' && !memory.personName) {
    errors.push('WAITING_FOR memories should identify a person');
  }

  return errors;
};

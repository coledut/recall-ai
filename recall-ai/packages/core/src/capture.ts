import { RawCaptureEvent, SourceType } from './types';

// Pre-filtering before AI invocation - cheap deterministic filtering per spec section 13
// Most emails/messages never reach the model

export interface CandidateScore {
  shouldProcess: boolean;
  score: number; // 0-1, higher = more likely to contain actionable content
  reasons: string[];
}

export const scoreCapture = (capture: RawCaptureEvent): CandidateScore => {
  const reasons: string[] = [];
  let score = 0;

  // Quick captures bypass pre-filtering (user explicitly chose to capture)
  if (capture.sourceType === 'QUICK_CAPTURE') {
    return {
      shouldProcess: true,
      score: 1.0,
      reasons: ['User explicitly captured this'],
    };
  }

  // Voice/File/Image capture also bypass filtering (deliberate user action)
  if (
    capture.sourceType === 'VOICE' ||
    capture.sourceType === 'FILE' ||
    capture.sourceType === 'IMAGE'
  ) {
    return {
      shouldProcess: true,
      score: 1.0,
      reasons: ['Deliberate user-initiated capture'],
    };
  }

  // Calendar events - check for relevant content
  if (capture.sourceType === 'CALENDAR') {
    if (
      capture.text.toLowerCase().includes('deadline') ||
      capture.text.toLowerCase().includes('commit') ||
      capture.text.toLowerCase().includes('review') ||
      capture.text.toLowerCase().includes('prepare')
    ) {
      score += 0.4;
      reasons.push('Contains deadline/commitment keywords');
    }
    if (capture.participants && capture.participants.length > 1) {
      score += 0.2;
      reasons.push('Multi-participant meeting');
    }
  }

  // Email - look for actionable patterns
  if (capture.sourceType === 'GMAIL') {
    const text = capture.text.toLowerCase();

    // Commitment verbs
    if (
      text.match(/\b(will|can you|could you|please|need to|must|should|commit)\b/i)
    ) {
      score += 0.3;
      reasons.push('Contains commitment language');
    }

    // Question marks (often indicate follow-ups needed)
    if ((capture.text.match(/\?/g) || []).length > 0) {
      score += 0.15;
      reasons.push('Contains questions');
    }

    // Deadline indicators
    if (text.match(/\b(deadline|by|until|before|due|asap|urgent)\b/i)) {
      score += 0.25;
      reasons.push('Contains deadline language');
    }

    // Action indicators
    if (
      text.match(
        /\b(follow up|check on|review|approve|sign|send|submit|complete)\b/i
      )
    ) {
      score += 0.25;
      reasons.push('Contains action language');
    }

    // Email length (very short emails often not actionable)
    if (capture.text.length < 30) {
      score -= 0.2;
      reasons.push('Very short message');
    }

    // Forward/reply context (higher likelihood of being about something important)
    if (capture.text.toLowerCase().startsWith('fwd:') || capture.threadId) {
      score += 0.1;
      reasons.push('Part of active thread or forwarded');
    }
  }

  // Forward-to-Recall (future source)
  if (capture.sourceType === 'FORWARD') {
    score = 0.9; // User forwarded it on purpose
    reasons.push('Explicitly forwarded to Recall');
  }

  score = Math.min(1, Math.max(0, score));

  return {
    shouldProcess: score >= 0.2, // Process if score >= 0.2 to minimize false negatives
    score,
    reasons,
  };
};

// Content hash for deduplication and caching
export const hashCapture = (capture: RawCaptureEvent): string => {
  const content = `${capture.sourceType}:${capture.externalId}:${capture.text.slice(0, 500)}`;
  // In production, use a proper hash function like crypto.createHash
  // This is a placeholder
  return Buffer.from(content).toString('base64').slice(0, 32);
};

// Capture age check - don't re-process old captures
export const isRecentCapture = (capture: RawCaptureEvent, maxAgeDays = 30): boolean => {
  const occurredAt = new Date(capture.occurredAt);
  const now = new Date();
  const ageDays = (now.getTime() - occurredAt.getTime()) / (1000 * 60 * 60 * 24);
  return ageDays <= maxAgeDays;
};

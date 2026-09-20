import { describe, it, expect } from 'vitest';
import {
  transitionMemoryStatus,
  calculateDedupScore,
  shouldMergeMemories,
  validateExtractedMemory,
} from './memory';
import { ExtractedMemory } from './types';

describe('Memory Lifecycle', () => {
  it('should transition from DETECTED to OPEN', () => {
    const result = transitionMemoryStatus('DETECTED', 'open');
    expect(result).toBe('OPEN');
  });

  it('should transition from OPEN to DUE_SOON', () => {
    const result = transitionMemoryStatus('OPEN', 'due_soon');
    expect(result).toBe('DUE_SOON');
  });

  it('should allow dismissal from OPEN', () => {
    const result = transitionMemoryStatus('OPEN', 'dismiss');
    expect(result).toBe('DISMISSED');
  });

  it('should not allow invalid transitions', () => {
    const result = transitionMemoryStatus('COMPLETED', 'open');
    expect(result).toBeNull();
  });
});

describe('Deduplication', () => {
  const testMemory: ExtractedMemory = {
    type: 'COMMITMENT',
    title: 'Send revised proposal to Ahmed',
    summary: 'Need to send the revised proposal document to Ahmed by Thursday',
    personName: 'Ahmed',
    confidence: 0.95,
  };

  it('should score high for identical type and person', () => {
    const score = calculateDedupScore(
      testMemory,
      'Send revised proposal to Ahmed',
      'COMMITMENT',
      'Send proposal to Ahmed',
      'Ahmed'
    );
    expect(score).toBeGreaterThan(0.6);
  });

  it('should score low for different types', () => {
    const score = calculateDedupScore(
      testMemory,
      'Send revised proposal to Ahmed',
      'WAITING_FOR',
      'Send proposal to Ahmed',
      'Ahmed'
    );
    expect(score).toBeLessThan(0.6);
  });

  it('should merge only when confidence is high', () => {
    const highConfidence = shouldMergeMemories(0.75);
    const lowConfidence = shouldMergeMemories(0.65);
    expect(highConfidence).toBe(true);
    expect(lowConfidence).toBe(false);
  });
});

describe('Memory Validation', () => {
  it('should reject memory without title', () => {
    const memory: ExtractedMemory = {
      type: 'TASK',
      title: '',
      summary: 'Some task',
      confidence: 0.8,
    };
    const errors = validateExtractedMemory(memory);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('title');
  });

  it('should require due date for DEADLINE type', () => {
    const memory: ExtractedMemory = {
      type: 'DEADLINE',
      title: 'Project delivery',
      summary: 'Deliver the project',
      confidence: 0.9,
      // No dueAt
    };
    const errors = validateExtractedMemory(memory);
    expect(errors.some((e) => e.includes('due date'))).toBe(true);
  });

  it('should warn on low confidence', () => {
    const memory: ExtractedMemory = {
      type: 'TASK',
      title: 'Something',
      summary: 'A task',
      confidence: 0.3,
    };
    const errors = validateExtractedMemory(memory);
    expect(errors.some((e) => e.includes('Low confidence'))).toBe(true);
  });

  it('should pass validation for good memory', () => {
    const memory: ExtractedMemory = {
      type: 'COMMITMENT',
      title: 'Send document',
      summary: 'Send the document to Bob',
      personName: 'Bob',
      confidence: 0.9,
      dueAt: new Date(Date.now() + 86400000), // Tomorrow
    };
    const errors = validateExtractedMemory(memory);
    expect(errors.filter((e) => !e.startsWith('WARNING')).length).toBe(0);
  });
});

import {
  ExtractMemoryCapabilityRequest,
  ExtractMemoryCapabilityResponse,
  AnswerMemoryQueryCapabilityRequest,
  AnswerMemoryQueryCapabilityResponse,
} from '@recall/core';

// AI Capability Service interface - per spec section 23
// Application code calls these capabilities, not specific models/providers
// This abstraction allows provider/model swapping without touching the rest of the app

export interface AICapabilityService {
  // Extract structured memories from raw text/capture
  extractMemory(
    request: ExtractMemoryCapabilityRequest
  ): Promise<ExtractMemoryCapabilityResponse>;

  // Classify/categorize memory (utility, optional optimization)
  classifyMemory(params: {
    title: string;
    summary: string;
  }): Promise<{ type: string; confidence: number }>;

  // Summarize a block of text (for daily briefs, etc.)
  summarizeContext(params: {
    text: string;
    maxLength?: number;
    language?: string;
  }): Promise<string>;

  // Answer a question using retrieved memories
  answerMemoryQuery(
    request: AnswerMemoryQueryCapabilityRequest
  ): Promise<AnswerMemoryQueryCapabilityResponse>;

  // Prioritize a list of memories (useful for Today sorting)
  prioritizeMemories(params: {
    memories: Array<{
      id: string;
      type: string;
      title: string;
      dueAt?: Date;
    }>;
    context?: string;
  }): Promise<Array<{ id: string; priority: number }>>;

  // Draft a follow-up message (always requires human review per spec 22)
  draftFollowup(params: {
    memoryTitle: string;
    person: string;
    context: string;
  }): Promise<string>;

  // Transcribe voice to text (delegated to STT provider, kept here for symmetry)
  transcribeVoice(params: {
    audioUrl: string;
    language?: string;
  }): Promise<{ text: string; language: string; confidence: number }>;
}

// Provider-agnostic usage tracking for cost control
export interface AIUsageRecord {
  userId: string;
  capability: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsdEstimate: number;
  latencyMs: number;
  timestamp: Date;
}

// Cost tracking callback
export type AIUsageCallback = (usage: AIUsageRecord) => Promise<void>;

// Service configuration
export interface AICapabilityServiceConfig {
  usageCallback?: AIUsageCallback;
  enableCaching?: boolean;
  tokenBudgets?: {
    [capability: string]: number;
  };
}

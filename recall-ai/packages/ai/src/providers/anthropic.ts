import Anthropic from '@anthropic-ai/sdk';
import {
  AICapabilityService,
  AICapabilityServiceConfig,
  AIUsageRecord,
} from '../capabilities';
import {
  ExtractMemoryCapabilityRequest,
  ExtractMemoryCapabilityResponse,
  AnswerMemoryQueryCapabilityRequest,
  AnswerMemoryQueryCapabilityResponse,
  ExtractMemoryCapabilityResponseSchema,
  AnswerMemoryQueryCapabilityResponseSchema,
} from '@recall/core';

export class AnthropicCapabilityService implements AICapabilityService {
  private client: Anthropic;
  private config: AICapabilityServiceConfig;

  constructor(apiKey: string, config: AICapabilityServiceConfig = {}) {
    this.client = new Anthropic({ apiKey });
    this.config = config;
  }

  private async trackUsage(usage: AIUsageRecord) {
    if (this.config.usageCallback) {
      await this.config.usageCallback(usage);
    }
  }

  async extractMemory(
    request: ExtractMemoryCapabilityRequest
  ): Promise<ExtractMemoryCapabilityResponse> {
    const { capture, targetLanguage = 'en' } = request;

    const prompt = `
You are an AI assistant that extracts structured memory/action items from captured text.

The user captured this text:
"""
${capture.text}
"""

Extract any actionable commitments, follow-ups, deadlines, decisions, or important facts.
Respond in ${targetLanguage}.

Respond with a JSON object containing:
{
  "memories": [
    {
      "type": "COMMITMENT|FOLLOW_UP|DEADLINE|WAITING_FOR|DECISION|TASK|IMPORTANT_FACT",
      "title": "short title",
      "summary": "longer description",
      "personName": "person if relevant",
      "personEmail": "email if known",
      "dueAt": "ISO8601 date if applicable",
      "importance": "LOW|MEDIUM|HIGH",
      "confidence": 0.0-1.0,
      "actionableStatements": ["statement1", "statement2"]
    }
  ]
}

Return only valid JSON, no additional text.
`.trim();

    const startTime = Date.now();
    const response = await this.client.messages.create({
      model: 'claude-3-5-haiku-20241022', // Haiku for cost control - simpler extraction
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const latencyMs = Date.now() - startTime;
    const outputText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Track usage for cost monitoring
    await this.trackUsage({
      userId: capture.userId,
      capability: 'extractMemory',
      provider: 'anthropic',
      model: 'claude-3-5-haiku-20241022',
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      costUsdEstimate:
        (response.usage.input_tokens / 1000000) * 0.8 +
        (response.usage.output_tokens / 1000000) * 2.4,
      latencyMs,
      timestamp: new Date(),
    });

    // Parse and validate response
    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch (e) {
      throw new Error(`Failed to parse AI response: ${outputText}`);
    }

    return ExtractMemoryCapabilityResponseSchema.parse({
      memories: parsed.memories || [],
      provenance: {
        sourceType: capture.sourceType,
        sourceExcerpt: capture.text.slice(0, 5000),
        sourceDate: capture.occurredAt,
        extractedAt: new Date(),
        extractionConfidence: parsed.confidence || 0.8,
      },
      rawOutput: outputText,
    });
  }

  async classifyMemory(params: {
    title: string;
    summary: string;
  }): Promise<{ type: string; confidence: number }> {
    // Simple classification - in real implementation could be smarter
    const text = `${params.title} ${params.summary}`.toLowerCase();

    if (text.includes('deadline') || text.includes('by ')) {
      return { type: 'DEADLINE', confidence: 0.8 };
    }
    if (text.includes('follow') || text.includes('check')) {
      return { type: 'FOLLOW_UP', confidence: 0.75 };
    }
    if (text.includes('wait') || text.includes('waiting')) {
      return { type: 'WAITING_FOR', confidence: 0.8 };
    }
    if (text.includes('decision') || text.includes('decided')) {
      return { type: 'DECISION', confidence: 0.85 };
    }

    return { type: 'TASK', confidence: 0.6 };
  }

  async summarizeContext(params: {
    text: string;
    maxLength?: number;
    language?: string;
  }): Promise<string> {
    const { text, maxLength = 500, language = 'en' } = params;

    const response = await this.client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: Math.ceil(maxLength / 4), // Rough token estimate
      messages: [
        {
          role: 'user',
          content: `Summarize the following text in ${language} in ${maxLength} characters or less:\n\n${text}`,
        },
      ],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  async answerMemoryQuery(
    request: AnswerMemoryQueryCapabilityRequest
  ): Promise<AnswerMemoryQueryCapabilityResponse> {
    const { query, retrievedMemories, targetLanguage = 'en' } = request;

    const context = retrievedMemories
      .map((m) => `- ${m.title}: ${m.summary} (Excerpt: "${m.excerpt}")`)
      .join('\n');

    const prompt = `
You are a helpful assistant answering questions based on retrieved memories.
Respond in ${targetLanguage}.

User's question: ${query}

Available memories:
${context}

Answer the question using ONLY the information from the retrieved memories.
If the answer cannot be found in the memories, say so clearly.
Cite which memories you used to answer.
`.trim();

    const startTime = Date.now();
    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Sonnet for more complex reasoning
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const latencyMs = Date.now() - startTime;
    const answer =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Track usage
    await this.trackUsage({
      userId: '',
      capability: 'answerMemoryQuery',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      costUsdEstimate:
        (response.usage.input_tokens / 1000000) * 3 +
        (response.usage.output_tokens / 1000000) * 15,
      latencyMs,
      timestamp: new Date(),
    });

    return AnswerMemoryQueryCapabilityResponseSchema.parse({
      answer,
      citedMemoryIds: retrievedMemories.map((m) => m.id),
      confidence: 0.85,
      sources: retrievedMemories.map((m) => ({
        memoryId: m.id,
        excerpt: m.excerpt,
      })),
    });
  }

  async prioritizeMemories(params: {
    memories: Array<{
      id: string;
      type: string;
      title: string;
      dueAt?: Date;
    }>;
    context?: string;
  }): Promise<Array<{ id: string; priority: number }>> {
    // Simple heuristic prioritization - can be enhanced with AI if needed
    const now = new Date();

    return params.memories
      .map((m) => {
        let priority = 0.5; // Base priority

        // Type-based
        if (m.type === 'DEADLINE') priority += 0.3;
        if (m.type === 'COMMITMENT') priority += 0.25;
        if (m.type === 'WAITING_FOR') priority += 0.2;

        // Date-based
        if (m.dueAt) {
          const daysUntilDue =
            (m.dueAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          if (daysUntilDue <= 1) priority += 0.3; // Due soon
          else if (daysUntilDue <= 3) priority += 0.15;
          else if (daysUntilDue < 0) priority += 0.4; // Overdue
        }

        return { id: m.id, priority: Math.min(1, priority) };
      })
      .sort((a, b) => b.priority - a.priority);
  }

  async draftFollowup(params: {
    memoryTitle: string;
    person: string;
    context: string;
  }): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Draft a brief, professional follow-up message for: "${params.memoryTitle}" to ${params.person}. Context: ${params.context}`,
        },
      ],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  async transcribeVoice(params: {
    audioUrl: string;
    language?: string;
  }): Promise<{ text: string; language: string; confidence: number }> {
    // This should be delegated to an actual STT provider (Deepgram, etc.)
    // Placeholder - not implemented yet
    throw new Error(
      'Voice transcription not implemented - delegate to STT provider'
    );
  }
}

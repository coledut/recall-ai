import { MemoryType, MemoryStatus } from '@recall/core';

export interface Memory {
  id: string;
  type: MemoryType;
  title: string;
  summary: string;
  status: MemoryStatus;
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  dueAt?: string | null;
  personRaw?: string | null;
  sourceExcerpt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaptureResult {
  success: boolean;
  memoriesCreated: number;
  memories: Memory[];
}

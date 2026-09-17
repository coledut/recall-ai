export type MemoryStatus = 'pending' | 'captured' | 'processed' | 'archived';
export type MemorySource = 'email' | 'calendar' | 'voice' | 'file' | 'manual';
export type MemoryType = 'commitment' | 'task' | 'note' | 'decision';

export interface Memory {
  id: string;
  user_id: string;
  title: string;
  content: string;
  source: MemorySource;
  type: MemoryType;
  status: MemoryStatus;
  tags: string[];
  due_date?: string;
  priority?: 'high' | 'medium' | 'low';
  extracted_at: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

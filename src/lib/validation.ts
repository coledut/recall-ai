import { z } from 'zod';

export const memorySourceSchema = z.enum(['email', 'calendar', 'voice', 'file', 'manual']);
export const memoryTypeSchema = z.enum(['commitment', 'task', 'note', 'decision']);
export const memoryStatusSchema = z.enum(['pending', 'captured', 'processed', 'archived']);

export const createMemorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  source: memorySourceSchema,
  type: memoryTypeSchema,
  tags: z.array(z.string()).default([]),
  due_date: z.string().optional(),
});

export type CreateMemoryInput = z.infer<typeof createMemorySchema>;

export const updateMemorySchema = createMemorySchema.partial();
export type UpdateMemoryInput = z.infer<typeof updateMemorySchema>;

export const signUpSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInInput = z.infer<typeof signInSchema>;

import { z } from 'zod';

export const createStorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(10000),
  mediaUrls: z.array(z.string().url()).default([]),
  visibility: z.enum(['public', 'relatives']).default('public'),
});

export const updateStorySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  visibility: z.enum(['public', 'relatives']).optional(),
});

export const voteStorySchema = z.object({
  type: z.enum(['up', 'down']),
});

export const addCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
});

export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type UpdateStoryInput = z.infer<typeof updateStorySchema>;
export type VoteStoryInput = z.infer<typeof voteStorySchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;

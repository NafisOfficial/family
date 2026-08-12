import { z } from 'zod';

const RELATIONSHIP_TYPES = [
  'father',
  'mother',
  'son',
  'daughter',
  'spouse',
  'brother',
  'sister',
  'grandfather',
  'grandmother',
  'grandson',
  'granddaughter',
  'uncle',
  'aunt',
  'nephew',
  'niece',
  'cousin',
] as const;

export const addFamilyMemberSchema = z.object({
  displayName: z.string().min(1).max(100),
  dateOfBirth: z.string().datetime().optional(),
  dateOfDeath: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  bio: z.string().max(500).optional(),
  isAlive: z.boolean().default(true),
  linkedUserId: z.string().optional(),
});

export const editFamilyMemberSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  dateOfBirth: z.string().datetime().optional().or(z.null()),
  dateOfDeath: z.string().datetime().optional().or(z.null()),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  bio: z.string().max(500).optional(),
  isAlive: z.boolean().optional(),
  linkedUserId: z.string().optional().or(z.null()),
});

export const addRelationshipSchema = z.object({
  fromMemberId: z.string(),
  toMemberId: z.string(),
  relationshipType: z.enum(RELATIONSHIP_TYPES),
});

export const sendConnectionRequestSchema = z.object({
  receiverUsername: z.string().min(1),
  relationshipType: z.enum(RELATIONSHIP_TYPES),
});

export type AddFamilyMemberInput = z.infer<typeof addFamilyMemberSchema>;
export type EditFamilyMemberInput = z.infer<typeof editFamilyMemberSchema>;
export type AddRelationshipInput = z.infer<typeof addRelationshipSchema>;
export type SendConnectionRequestInput = z.infer<typeof sendConnectionRequestSchema>;

export interface UserDTO {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  dateOfBirth: Date | null;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyMemberDTO {
  _id: string;
  treeOwner: string;
  linkedUser: string | null;
  displayName: string;
  avatarUrl: string;
  dateOfBirth: Date | null;
  dateOfDeath: Date | null;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  bio: string;
  isAlive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type RelationshipType =
  | "father"
  | "mother"
  | "son"
  | "daughter"
  | "spouse"
  | "brother"
  | "sister"
  | "grandfather"
  | "grandmother"
  | "grandson"
  | "granddaughter"
  | "uncle"
  | "aunt"
  | "nephew"
  | "niece"
  | "cousin";

export interface FamilyRelationshipDTO {
  _id: string;
  treeOwner: string;
  fromMember: string;
  toMember: string;
  relationshipType: RelationshipType;
  isConfirmed: boolean;
  createdAt: Date;
}

export interface ConnectionRequestDTO {
  _id: string;
  sender: string;
  receiver: string;
  relationshipType: RelationshipType;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface StoryDTO {
  _id: string;
  author: string;
  title: string;
  content: string;
  mediaUrls: string[];
  visibility: "public" | "relatives";
  upvotesCount: number;
  downvotesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoteDTO {
  _id: string;
  user: string;
  story: string;
  type: "up" | "down";
  createdAt: Date;
}

export interface CommentDTO {
  _id: string;
  author: string;
  story: string;
  content: string;
  createdAt: Date;
  hidden?: boolean;
  harmfulLabel?: string;
  harmfulConfidence?: number;
}

export interface NotificationDTO {
  _id: string;
  recipient: string;
  actor: string;
  type:
    | "connection_request"
    | "connection_accepted"
    | "story_upvote"
    | "story_comment"
    | "story_downvote";
  story: string | null;
  connectionRequest: string | null;
  isRead: boolean;
  createdAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface SingleResponse<T> {
  data: T;
}

export interface ErrorResponse {
  error: string;
}

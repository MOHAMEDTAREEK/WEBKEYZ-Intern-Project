/**
 * Defines the attributes required to create a mention, excluding the 'id', 'createdAt', and 'updatedAt' fields.
 */

export interface MentionAttributes {
  id: number;
  postId: number;
  mentionedUserId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MentionCreationAttributes
  extends Omit<MentionAttributes, "id" | "createdAt" | "updatedAt"> {}

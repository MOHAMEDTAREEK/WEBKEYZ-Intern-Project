/**
 * Defines the attributes required to create a mention, excluding the 'id', 'createdAt', and 'updatedAt' fields.
 */

interface MentionAttributes {
  id: number;
  postId: number;
  mentionedUserId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MentionCreationAttributes
  extends Omit<MentionAttributes, "id" | "createdAt" | "updatedAt"> {}

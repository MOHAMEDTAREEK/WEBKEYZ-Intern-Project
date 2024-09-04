interface MentionAttributes {
  id: number;
  postId: number;
  mentionedUserId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MentionCreationAttributes
  extends Omit<MentionAttributes, "id" | "createdAt" | "updatedAt"> {}

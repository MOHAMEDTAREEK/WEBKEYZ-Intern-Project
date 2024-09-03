interface CommentAttributes {
  id: number;
  description: string;
  userId: number;
  postId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CommentCreationAttributes extends Omit<CommentAttributes, "id"> {}

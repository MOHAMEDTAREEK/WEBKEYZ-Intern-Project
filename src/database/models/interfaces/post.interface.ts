interface PostAttributes {
  id: number;
  description: string;
  image?: string;
  userId: number;
  like: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PostCreationAttributes extends Omit<PostAttributes, "id"> {}

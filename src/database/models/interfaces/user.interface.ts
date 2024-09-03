interface UserAttributes {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  profilePicture?: string;
  refreshToken?: string;
  resetToken?: string;
  role: "admin" | "hr" | "user";
  createdAt?: Date;
  updatedAt?: Date;
  googleId?: string;
}

interface UserCreationAttributes extends Omit<UserAttributes, "id"> {}

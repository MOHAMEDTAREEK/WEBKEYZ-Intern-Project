/**
 * Defines the attributes of a user including id, name, email, password, profile picture,
 * refresh token, reset token, role, creation and update timestamps, Google ID, and mention count.
 */

export interface UserAttributes {
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
  mentionCount?: number;
}

export interface UserCreationAttributes extends Omit<UserAttributes, "id"> {}
export interface userWithoutPassword extends Omit<UserAttributes, "password"> {}

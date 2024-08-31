import { UserRole } from "../../shared/enums/user-Role.enum";

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  refreshToken: string | null;
  role: UserRole;
  profilePicture: string | null;
  resetToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  googleId: string | null;
}

export type OptionalUser = IUser | null;
export type IUserWithoutPassword = Omit<IUser, "password">;

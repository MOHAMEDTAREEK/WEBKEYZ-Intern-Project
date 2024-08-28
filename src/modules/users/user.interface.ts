import { UserRole } from "../../shared/enums/user-Role.enum";

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  refreshToken: string | null;
  role: UserRole;
}

export type OptionalUser = IUser | null;
export type IUserWithoutPassword = Omit<IUser, "password">;

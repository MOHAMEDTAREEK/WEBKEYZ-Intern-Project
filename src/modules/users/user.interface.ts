export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  refreshToken: string | null;
}

export type OptionalUser = IUser | null;
export type IUserWithoutPassword = Omit<IUser, "password">;

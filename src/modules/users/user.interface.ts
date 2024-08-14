export interface IUser {
  id: number;
  name: string;

  password: string;
  email: string;

  refreshToken: string | null;
}

export type OptionalUser = IUser | null;
export type IUserWithoutPassword = Omit<IUser, "password">;

export interface UserAttributes {
  id: number;
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  refreshToken: string | null;
}

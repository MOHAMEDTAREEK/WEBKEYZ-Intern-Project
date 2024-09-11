import { UserRole } from "../../../shared/enums/user-Role.enum";

export class CreateUserDto {
  firstName!: string;
  lastName!: string;
  email!: string;
  password?: string;
  role!: UserRole;
  profilePicture!: string;
}

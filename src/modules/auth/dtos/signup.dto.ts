import { UserRole } from "../../../shared/enums/user-Role.enum";

export class SignupDto {
  firstName!: string;
  lastName!: string;
  email!: string;
  password!: string;
  role!: UserRole;
}

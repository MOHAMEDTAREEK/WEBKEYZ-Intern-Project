import User from "../../database/models/user.model";
import { IUser, IUserWithoutPassword } from "./user.interface";
import bcrypt from "bcrypt";
import { BaseError } from "../../shared/exceptions/base.error";
export const getUsers = async () => {
  return await User.findAll();
};

export const getUserById = async (
  userId: number
): Promise<IUserWithoutPassword> => {
  const user: IUserWithoutPassword = (await User.findByPk(userId, {
    attributes: {
      exclude: ["password"],
    },
  })) as unknown as IUserWithoutPassword;
  return user;
};
export const getUserByEmail = async (email: string) => {
  const user = await User.findOne({
    where: { email },
  });
  return user;
};

export const createUser = async (
  userData: any
): Promise<IUserWithoutPassword> => {
  const hasedPassword = await bcrypt.hash(userData.password, 10);
  const user: IUserWithoutPassword = (await User.create({
    ...userData,
    password: hasedPassword,
  })) as unknown as IUserWithoutPassword;
  return user;
};

export const updateUserById = async (userId: number, updatedData: any) => {
  const user = await User.findByPk(userId);
  if (!user) throw new BaseError("User not found", 404);
  await user.update(updatedData);
  return user;
};

export const validateCredentials = async (email: string, password: string) => {
  const user: IUser = (await User.findOne({
    where: { email },
  })) as unknown as IUser;
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new BaseError("Invalid credentials", 401);

  user.password = undefined;

  return user;
};

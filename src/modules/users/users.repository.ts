import sequelize from "../../shared/db/model";
import { User } from "./user.model";

export const getUsers = async () => {
  return await User.findAll();
};

export const createUser = async (userData: any) => {
  return await User.create(userData);
};

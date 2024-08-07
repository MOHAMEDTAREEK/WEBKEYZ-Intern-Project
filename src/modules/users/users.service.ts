import * as userRepository from "./users.repository";
export const getUsers = async () => {
  const users = await userRepository.getUsers();
  return users;
};
export const createUser = async (userData: any) => {
  const createdUser = await userRepository.createUser(userData);
  return createdUser;
};

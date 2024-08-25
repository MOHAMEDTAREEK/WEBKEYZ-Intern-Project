import { deleteUser } from "../modules/users/users.controller";
import { Request, Response } from "express";
import * as userService from "../modules/users/users.service";
import * as userRepository from "../modules/users/users.repository"; // Import the userRepository object
import Model from "sequelize/types/model";
import { getUsers } from "../modules/users/users.repository";

describe("User", () => {
  it("should return a list of users when repository has users", async () => {
    const mockUsers = [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Doe" },
    ];
    jest
      .spyOn(userRepository, "getUsers")
      .mockResolvedValue(mockUsers as unknown as Model<any, any>[]);

    const result = await getUsers();

    expect(result).toEqual(mockUsers);
    expect(userRepository.getUsers).toHaveBeenCalledTimes(1);
  });
});

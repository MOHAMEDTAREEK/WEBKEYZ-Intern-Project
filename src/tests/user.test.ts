import { Request, Response } from "express";
import * as userService from "../modules/users/users.service";
import { getUsers } from "../modules/users/users.controller";

describe("UserController", () => {
  describe("getUsers", () => {
    it("should return all users", async () => {
      const req = {} as Request;
      const res = {
        send: jest.fn(),
      } as unknown as Response;

      const mockUsers = [
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ];
      jest.spyOn(userService, "getUsers").mockResolvedValue(mockUsers as any);

      await getUsers(req, res);

      expect(userService.getUsers).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(mockUsers);
    });
    it("should return an empty array if no users are found", async () => {
      const req = {} as Request;
      const res = {
        send: jest.fn(),
      } as unknown as Response;
      jest.spyOn(userService, "getUsers").mockResolvedValue([] as any);
      await getUsers(req, res);
      expect(userService.getUsers).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith([]);
    });
    it("should throw an error if userService.getUsers throws an error", async () => {
      const req = {} as Request;
      const res = {
        send: jest.fn(),
      } as unknown as Response;
      jest
        .spyOn(userService, "getUsers")
        .mockRejectedValue(new Error("Failed to get users"));
      await expect(getUsers(req, res)).rejects.toThrow("Failed to get users");
    });
  });
});

import * as userRepository from "../../src/modules/users/users.repository"; // Adjust import path
import * as authService from "../../src/modules/auth/auth.service"; // Adjust import path
import {
  getTokens,
  signUp,
  updateRefreshToken,
} from "../../src/modules/auth/auth.service"; // Adjust import path

jest.mock("../../src/modules/users/users.repository");
jest.mock("../../src/modules/auth/auth.service");

describe("Auth Service", () => {
  describe("signUp", () => {});
});

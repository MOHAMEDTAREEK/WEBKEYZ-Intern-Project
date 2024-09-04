import * as authService from "./auth.service";
import * as userService from "../users/users.service";
import * as userRepository from "../users/users.repository";
import { Request, Response } from "express";
import { BaseError } from "../../shared/exceptions/base.error";
import { SignupDto } from "./dtos/signup.dto";
import { LoginDto } from "./dtos/login.dto";
import { sendEmail } from "../../shared/util/send-email";
import { ErrorMessage } from "../../shared/enums/constants/error-message.enum";
import { HttpStatusCode } from "axios";
import { IResponse } from "../../shared/interfaces/IResponse.interface";
import { createResponse } from "../../shared/util/create-response";
import { SuccessMessage } from "../../shared/enums/constants/info-message.enum";

/**
 * Handles user sign up.
 * - Checks if the user already exists.
 * - Signs up the user and sets cookies for tokens.
 * - Returns the user and tokens in the response.
 *
 * @param {Request} req - The request object containing user data in the body.
 * @param {Response} res - The response object to send back the user and tokens.
 * @returns {Promise<Response>} A promise that resolves when the user sign up process is completed.
 */

export const customSignUp = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userData: SignupDto = req.body;
  const userExists = await userService.getUserByEmail(userData.email);
  if (userExists) {
    throw new BaseError(
      ErrorMessage.USER_ALREADY_EXISTS,
      HttpStatusCode.BadRequest
    );
  }
  const { user, tokens } = await authService.signUp(userData);

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: true,
  });
  res.cookie("accessToken", tokens.accessToken, {
    httpOnly: true,
    secure: true,
  });

  const response: IResponse = createResponse(
    HttpStatusCode.Created,
    SuccessMessage.USER_CREATION_SUCCESS,
    { user, tokens }
  );
  return res.send(response);
};

/**
 * Handles user login.
 * - Logs in the user and sets cookies for tokens.
 * - Returns the user and tokens in the response.
 *
 * @param {Request} req - The request object containing user data in the body.
 * @param {Response} res - The response object to send back the user and tokens.
 * @returns {Promise<Response>} A promise that resolves when the user login process is completed.
 */

export const customLogin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userData: LoginDto = req.body;
  const { user, tokens } = await authService.logIn(userData);

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: true,
  });
  res.cookie("accessToken", tokens.accessToken, {
    httpOnly: true,
    secure: true,
  });
  const response: IResponse = createResponse(
    HttpStatusCode.Created,
    SuccessMessage.USER_LOGIN_SUCCESS,
    { user, tokens }
  );
  return res.send(response);
};

/**
 * Refreshes user tokens.
 * - Validates the refresh token.
 * - Generates new tokens and sets new cookies.
 * - Returns the new tokens in the response.
 *
 * @param {Request} req - The request object containing the refresh token in cookies.
 * @param {Response} res - The response object to send back the new tokens.
 * @returns {Promise<Response>} A promise that resolves when the token refresh process is completed.
 */
export const customRefreshTokens = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new BaseError(
      ErrorMessage.INVALID_CREDENTIALS,
      HttpStatusCode.Unauthorized
    );
  }
  const { newAccessToken } = await authService.refreshTokens(refreshToken);

  if (!newAccessToken) {
    throw new BaseError(
      ErrorMessage.FAILED_TO_GENERATE_ACCESS_TOKEN,
      HttpStatusCode.InternalServerError
    );
  }

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.TOKEN_REFRESH_SUCCESS,
    newAccessToken
  );
  return res.send(response);
};

/**
 * Handles the process of resetting a user's password.
 * - Retrieves the user's email, generates a reset token.
 * - Sends a password reset link to the user's email.
 * - Returns the reset token.
 *
 * @param {Request} req - The request object containing the user's email.
 * @param {Response} res - The response object to send the reset token or error.
 * @returns {Promise<Response>} A promise that resolves once the reset token is sent.
 */
export const customForgotPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email } = req.body;
  const user = await userRepository.getUserByEmail(email);
  if (!user) {
    throw new BaseError("User not found", 404);
  }
  const userId = user.dataValues.id;
  const userEmail = user.dataValues.email;
  const resetToken = await authService.generateResetToken(userId, userEmail);
  if (!resetToken) {
    throw new BaseError(
      ErrorMessage.FAILED_TO_GENERATE_RESET_TOKEN,
      HttpStatusCode.InternalServerError
    );
  }
  await sendEmail(
    email,
    `Click the following link to reset your password: http://localhost:3000/reset-password/:${resetToken}`
  );
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.RESET_TOKEN_CREATED_SUCCESS,
    { resetToken: resetToken }
  );
  return res.send(response);
};

/**
 * Resets the password for a user based on the provided token and new password.
 *
 * @param {Request} req - The request object containing the new password in the body and the token in the parameters.
 * @param {Response} res - The response object to send the result of the password reset.
 * @throws {BaseError} When the token is invalid or expired.
 * @returns {Promise<Response>} A promise that resolves when the password is successfully reset.
 */
export const customResetPassword = async (req: Request, res: Response) => {
  const { password } = req.body;
  const { token } = req.params;

  if (!token) {
    throw new BaseError(
      ErrorMessage.TOKEN_REQUIRED,
      HttpStatusCode.Unauthorized
    );
  }
  const userData = await authService.verifyResetToken(token);
  if (!userData) {
    throw new BaseError(
      ErrorMessage.INVALID_OR_EXPIRED_TOKEN,
      HttpStatusCode.Unauthorized
    );
  }

  await authService.resetPassword(userData.id, password);
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.PASSWORD_RESET_SUCCESS
  );
  return res.send(response);
};

/**
 * Resets the password for a user without requiring a token.
 *
 * @param {Request} req - The request object containing the user's email and new password.
 * @param {Response} res - The response object to send the result of the password reset.
 * @returns {Promise<Response>} A promise that resolves once the password is successfully reset.
 * @throws {BaseError} Throws an error if the user is not found.
 */
export const customResetPasswordWithoutToken = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email, password } = req.body;
  if (!email) {
    throw new BaseError(ErrorMessage.EMAIL_REQUIRED, HttpStatusCode.BadRequest);
  }
  const user = await userRepository.getUserByEmail(email);
  if (!user) {
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  }
  await authService.resetPassword(user.dataValues.id, password);
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.PASSWORD_RESET_SUCCESS
  );
  return res.send(response);
};

/**
 * Clears the access and refresh tokens from the response cookies to log out the user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} A message indicating successful logout.
 */
export const customLogout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  const response: IResponse = createResponse(
    HttpStatusCode.NoContent,
    SuccessMessage.USER_LOGOUT_SUCCESS
  );
  return res.send(response);
};

/**
 * Asynchronously invites an HR user by email.
 * - Checks if the user already exists.
 * - Invites the HR and sends an email with a temporary password.
 * - Returns a success message.
 *
 * @param {Request} req - The request object containing the email in the body.
 * @param {Response} res - The response object to send the result.
 * @returns {Promise<Response>} A promise that resolves when the HR invitation process is completed.
 * @throws {BaseError} If the user already exists.
 */

export const customInviteHr = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await userRepository.getUserByEmail(email);
  if (user) {
    throw new BaseError(
      ErrorMessage.USER_ALREADY_EXISTS,
      HttpStatusCode.BadRequest
    );
  }
  const newHr = await authService.inviteHr(email);
  await sendEmail(
    email,
    `Hi Hr this is your new temp password please login with it ${newHr.password}`
  );
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.Invitation_SENT_SUCCESS
  );
  return res.send(response);
};

/**
 * Handles the Google authentication callback.
 *
 * This function is called when a user completes the Google authentication flow. It retrieves the user data and access token from the request, and then sets the necessary cookies for the user session.
 *
 * @param {Request} req - The request object, which contains the user data and access token from the Google authentication flow.
 * @param {Response} res - The response object, which is used to set the cookies and redirect the user to the "/users/" endpoint.
 */
export const googleAuthCallback = async (req: Request, res: Response) => {
  const { user, accessToken } = req.user as any;
  if (!user) {
    throw new BaseError(
      ErrorMessage.AUTHENTICATION_FAILED,
      HttpStatusCode.Unauthorized
    );
  }

  const token = await authService.getGoogleToken(user);

  res.cookie("jwt", token, { httpOnly: true });
  res.cookie("googleAccessToken", accessToken, { httpOnly: true });

  res.redirect("/users/");
};

/**
 * Retrieves the Google access token from the request body and handles the Google authentication flow.
 * If the access token is missing in the request body, it sends a 400 status with a message indicating the requirement.
 * If the user exists, it logs the user in and returns the user access token.
 * If the user does not exist, it creates a new user and returns the user access token.
 *
 * @param {Request} req - The request object containing the Google access token in the body.
 * @param {Response} res - The response object to send back the user data or error message.
 */
export const getGoogleAccessToken = async (req: Request, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) {
    throw new BaseError(
      ErrorMessage.ACCESS_TOKEN_REQUIRED,
      HttpStatusCode.Unauthorized
    );
  }

  const userData = await authService.getUserDataFromToken(idToken);

  const userExists = await userRepository.getUserByEmail(userData.email);

  if (userExists) {
    const userAccessToken = await authService.loginGoogleUser(userData.email);
    res.cookie("accessToken", userAccessToken, {
      httpOnly: true,
      secure: true,
    });

    const response: IResponse = createResponse(
      HttpStatusCode.Ok,
      SuccessMessage.USER_LOGIN_SUCCESS,
      { userAccessToken: userAccessToken }
    );
    return res.send(response);
  }
  const user = await userRepository.createUser(userData);
  const accessToken = await authService.getGoogleToken(userData);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
  });

  res.status(201).send({ user, accessToken });
  const response: IResponse = createResponse(
    HttpStatusCode.Created,
    SuccessMessage.USER_CREATION_SUCCESS,
    { user: user, userAccessToken: accessToken }
  );
  return res.send(response);
};

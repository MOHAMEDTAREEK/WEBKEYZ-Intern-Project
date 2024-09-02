import { Router } from "express";
import { validationMiddleware } from "../../shared/middleware/validation.middleware";
import { registerSchema } from "./schemas/register.schema";
import { loginSchema } from "./schemas/login.schema";
import {
  customForgotPassword,
  getGoogleAccessToken,
  googleAuthCallback,
  customInviteHr,
  customLogin,
  customLogout,
  customRefreshTokens,
  customResetPassword,
  customResetPasswordWithoutToken,
  customSignUp,
  getGoogleRefreshToken,
} from "./auth.controller";
import { emailCheckingSchema } from "./schemas/email-checking.schema";
import { resetPasswordSchema } from "./schemas/reset-password.schema";
import passport from "passport";
import asyncWrapper from "../../shared/util/async-wrapper";
import { googleAccessTokenSchema } from "./schemas/google-access-token.schema";
import { googleRefreshTokenSchema } from "./schemas/google-refresh-token.schema";

/**
 * Defines the routes for user authentication operations.
 * Includes endpoints for user login, signup, and token refresh.
 */
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth WebKeyz
 *   description: Authentication
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User signup
 *     tags: [Auth PlayGround]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterSchema'
 *     responses:
 *       201:
 *         description: Successfully signed up
 *       400:
 *         description: Validation error
 */

router.post(
  "/signup",
  validationMiddleware(registerSchema),
  asyncWrapper(customSignUp)
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth PlayGround]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginSchema'
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         headers:
 *           Set-Cookie:
 *             description: Set-Cookie header with tokens
 *             schema:
 *               type: string
 *               example: accessToken=yourAccessToken; refreshToken=yourRefreshToken
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

router.post(
  "/login",
  validationMiddleware(loginSchema),
  asyncWrapper(customLogin)
);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth PlayGround]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully refreshed token
 *         headers:
 *           Set-Cookie:
 *             description: Set-Cookie header with new access token
 *             schema:
 *               type: string
 *               example: accessToken=newAccessToken
 *       400:
 *         description: Refresh token is missing
 *       401:
 *         description: Unauthorized
 */

router.post("/refresh-token", asyncWrapper(customRefreshTokens));

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth PlayGround]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailCheckingSchema'
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resetToken:
 *                   type: string
 *                   example: "yourResetToken"
 *         headers:
 *           Set-Cookie:
 *             description: Optional - Set-Cookie header with reset token if stored in cookies
 *             schema:
 *               type: string
 *               example: resetToken=yourResetToken; HttpOnly; Secure
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
router.post(
  "/forgot-password",
  validationMiddleware(emailCheckingSchema),
  asyncWrapper(customForgotPassword)
);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth PlayGround]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordSchema'
 *     responses:
 *       200:
 *         description: Password successfully reset
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Password reset successfully
 *       400:
 *         description: Validation error or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Invalid or expired token
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: User not found
 */

router.post(
  "/reset-password/:token",
  validationMiddleware(resetPasswordSchema),
  asyncWrapper(customResetPassword)
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password without token
 *     tags: [Auth PlayGround]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordSchema'
 *     responses:
 *       200:
 *         description: Password successfully reset
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/reset-password",
  validationMiddleware(resetPasswordSchema),
  asyncWrapper(customResetPasswordWithoutToken)
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout users
 *     tags: [Auth PlayGround]
 *     responses:
 *       200:
 *         description: Successfully logged out
 *
 */
router.post("/logout", asyncWrapper(customLogout));

/**
 * @swagger
 * /auth/invite-hr:
 *   post:
 *     summary: Invite HR to the platform
 *     tags: [Auth PlayGround]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailCheckingSchema'
 *     responses:
 *       200:
 *         description: Invitation sent
 *       400:
 *         description: Validation error
 */
router.post(
  "/invite-hr",
  validationMiddleware(emailCheckingSchema),
  asyncWrapper(customInviteHr)
);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Google authentication
 *     tags: [Auth PlayGround]
 *     description: |
 *       Redirects to Google for authentication. This is a redirection endpoint and cannot be tested via Swagger UI.
 *     responses:
 *       302:
 *         description: Redirect to Google authentication
 *         headers:
 *           Location:
 *             description: URL to redirect to
 *             schema:
 *               type: string
 *               example: https://accounts.google.com/o/oauth2/auth
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google authentication callback
 *     tags: [Auth PlayGround]
 *     description: |
 *       Handles the OAuth callback from Google. This endpoint will redirect the user and cannot be tested directly in Swagger UI.
 *     responses:
 *       302:
 *         description: Redirect after Google authentication
 *         headers:
 *           Location:
 *             description: URL where the user is redirected after authentication
 *             schema:
 *               type: string
 *               example: http://localhost:3000/home
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  asyncWrapper(googleAuthCallback)
);

/**
 * @swagger
 * /auth/signup/access-token:
 *   post:
 *     summary: Get access token
 *     tags: [Auth WebKeyz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken:
 *                 type: string
 *             required:
 *               - token
 *     responses:
 *       200:
 *         description: Access token issued
 *       400:
 *         description: Invalid request
 */
router.post(
  "/signup/access-token",
  validationMiddleware(googleAccessTokenSchema),
  asyncWrapper(getGoogleAccessToken)
);

/**
 * @swagger
 * /auth/login/refresh-token:
 *   post:
 *     summary: Get refresh token
 *     tags: [Auth WebKeyz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: Refresh token issued
 *       400:
 *         description: Invalid request
 */
router.post(
  "/login/refresh-token",
  validationMiddleware(googleRefreshTokenSchema),
  asyncWrapper(getGoogleRefreshToken)
);

export default router;

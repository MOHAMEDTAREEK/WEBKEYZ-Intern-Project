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
  customIogout,
  customRefreshTokens,
  customResetPassword,
  customResetPasswordWithoutToken,
  customSignUp,
  getGoogleRefreshToken,
} from "./auth.controller";
import { emailCheckingSchema } from "./schemas/email-checking.schema";
import { resetPasswordSchema } from "./schemas/reset-password.schema";
import passport from "passport";

/**
 * Defines the routes for user authentication operations.
 * Includes endpoints for user login, signup, and token refresh.
 */
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Authorization
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User signup
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/auth/RegisterSchema'
 *     responses:
 *       201:
 *         description: Successfully signed up
 *       400:
 *         description: Validation error
 */
router.post("/signup", validationMiddleware(registerSchema), customSignUp);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/auth/LoginSchema'
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/login", validationMiddleware(loginSchema), customLogin);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully refreshed token
 *       401:
 *         description: Unauthorized
 */
router.post("/refresh-token", customRefreshTokens);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/auth/EmailCheckingSchema'
 *     responses:
 *       200:
 *         description: Password reset link sent
 *       400:
 *         description: Validation error
 */
router.post(
  "/forgot-password",
  validationMiddleware(emailCheckingSchema),
  customForgotPassword
);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
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
 *             $ref: '#/components/schemas/auth/ResetPasswordSchema'
 *     responses:
 *       200:
 *         description: Password successfully reset
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/reset-password/:token",
  validationMiddleware(resetPasswordSchema),
  customResetPassword
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password without token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/auth/ResetPasswordSchema'
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
  customResetPasswordWithoutToken
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout users
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
router.post("/logout", customIogout);

/**
 * @swagger
 * /auth/invite-hr:
 *   post:
 *     summary: Invite HR to the platform
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/auth/EmailCheckingSchema'
 *     responses:
 *       200:
 *         description: Invitation sent
 *       400:
 *         description: Validation error
 */
router.post(
  "/invite-hr",
  validationMiddleware(emailCheckingSchema),
  customInviteHr
);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Google authentication
 *     tags: [Auth]
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
 *     tags: [Auth]
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
  googleAuthCallback
);

/**
 * @swagger
 * /auth/signup/access-token:
 *   post:
 *     summary: Get access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *             required:
 *               - token
 *     responses:
 *       200:
 *         description: Access token issued
 *       400:
 *         description: Invalid request
 */
router.post("/signup/access-token", getGoogleAccessToken);

router.post("/login/refresh-token", getGoogleRefreshToken);

export default router;

import { Router } from "express";
import { validationMiddleware } from "../../shared/middleware/validation.middleware";
import { registerSchema } from "./schemas/register.schema";
import { loginSchema } from "./schemas/login.schema";
import {
  forgotPassword,
  googleAuthCallback,
  inviteHr,
  login,
  logout,
  refreshTokens,
  resetPassword,
  resetPasswordWithoutToken,
  signUp,
} from "./auth.controller";
import { emailCheckingSchema } from "./schemas/email-checking.schema";
import { resetPasswordSchema } from "./schemas/reset-password.schema";
import passport from "passport";

/**
 * Defines the routes for user authentication operations.
 * Includes endpoints for user login, signup, and token refresh.
 */
const router = Router();

router.post("/signup", validationMiddleware(registerSchema), signUp);
router.post("/login", validationMiddleware(loginSchema), login);
router.post("/refresh-token", refreshTokens);
router.post(
  "/forgot-password",
  validationMiddleware(emailCheckingSchema),
  forgotPassword
);
router.post(
  "/reset-password/:token",
  validationMiddleware(resetPasswordSchema),
  resetPassword
);
router.post(
  "/reset-password",
  validationMiddleware(resetPasswordSchema),
  resetPasswordWithoutToken
);
router.post("/logout", logout);
router.post("/invite-hr", validationMiddleware(emailCheckingSchema), inviteHr);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleAuthCallback
);
export default router;

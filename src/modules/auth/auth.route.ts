import { Router } from "express";
import { validationMiddleware } from "../../shared/middleware/validation.middleware";
import { registerSchema } from "./schemas/register.schema";
import { loginSchema } from "./schemas/login.schema";
import {
  forgotPassword,
  login,
  logout,
  refreshTokens,
  resetPassword,
  resetPasswordWithoutToken,
  signUp,
} from "./auth.controller";
import verifyUser from "../../shared/middleware/verfiy-user.middleware";

/**
 * Defines the routes for user authentication operations.
 * Includes endpoints for user login, signup, and token refresh.
 */
const router = Router();

router.use(verifyUser);

router.post("/login", validationMiddleware(loginSchema), login);
router.post("/signup", validationMiddleware(registerSchema), signUp);
router.post("/refresh-token", refreshTokens);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/reset-password", resetPasswordWithoutToken);
router.post("/logout", logout);
export default router;

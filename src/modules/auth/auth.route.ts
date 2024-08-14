import { Router } from "express";
import { validationMiddleware } from "../../shared/middleware/validation.middleware";
import { registerSchema } from "./schemas/register.schema";
import { loginSchema } from "./schemas/login.schema";
import { login, signUp } from "./auth.controller";
const router = Router();

router.post("/login", validationMiddleware(loginSchema), login);
router.post("/signup", validationMiddleware(registerSchema), signUp);

export default router;

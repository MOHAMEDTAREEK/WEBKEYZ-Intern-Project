import { Router } from "express";
import { error, getUsers } from "./users.controller";
import { createUser } from "./users.controller";
import { HttpException } from "../../shared/exceptions/http.exception";
import { HttpStatus } from "../../shared/enums/http-Status.enum";
import { validationMiddleware } from "../../shared/middleware/validation.middleware";
import { userSchema } from "./user.schema";

const router = Router();

/**
 * @swagger
 * /users/:
 *   get:
 *     summary: Get all users
 *     description: Get all users.
 *     responses:
 *       200:
 *         description: Successful response
 *
 */
router.get("/", getUsers);

/**
 * @swagger
 * /users/:
 *   post:
 *     summary: Create a resource
 *     description: Create a new resource.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: Successful response
 *
 */
router.post("/", validationMiddleware(userSchema, "body"), createUser);

router.get("/error", error);

export default router;

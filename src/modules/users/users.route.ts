import { Router } from "express";
import { error, getUsers } from "./users.controller";
import { createUser } from "./users.controller";
import { validationMiddleware } from "../../shared/middleware/validation.middleware";
import { userSchema } from "./user.schema";
import asyncWrapper from "../../shared/util/async-wrapper";

/**
 * Defines routes for user-related operations.
 */

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
router.get("/", asyncWrapper(getUsers));

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

router.get("/error", asyncWrapper(error));

export default router;

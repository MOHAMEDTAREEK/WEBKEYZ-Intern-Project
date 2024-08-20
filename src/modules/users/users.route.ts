import { Router } from "express";
import {
  getUserByEmail,
  getUserById,
  getUsers,
  uploadImage,
} from "./users.controller";
import { createUser } from "./users.controller";
import { validationMiddleware } from "../../shared/middleware/validation.middleware";
import { userSchema } from "./schemas/user.schema";
import asyncWrapper from "../../shared/util/async-wrapper";
import { authorizeRole } from "../../shared/middleware/authorization.middleware";
import { UserRole } from "../../shared/enums/user-Role.enum";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { upload } from "../../shared/middleware/image-upload.middleware";

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
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  // authMiddleware,
  // authorizeRole([UserRole.Admin]),
  asyncWrapper(getUsers)
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Get a user by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user.
 *         schema:
 *           type: string
 *           example: 123456789
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *
 */
router.get("/:id", asyncWrapper(getUserById));

router.get("/email/:email", asyncWrapper(getUserByEmail));
/**
 * @swagger
 * /users/:
 *   post:
 *     summary: Create a user
 *     description: Create a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 *
 */
router.post("/", validationMiddleware(userSchema), createUser);
router.post("/upload", upload.single("image"), asyncWrapper(uploadImage));

export default router;

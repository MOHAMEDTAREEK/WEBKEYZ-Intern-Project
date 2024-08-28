import { Router, Response } from "express";
import {
  deleteUser,
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
import { googleAuth } from "../../shared/middleware/googleAuth.middleware";
import { idCheckingSchema } from "./schemas/idChecking.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/users/User'
 *       404:
 *         description: No users found
 */
router.get("/", asyncWrapper(getUsers));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/users/User'
 *       404:
 *         description: User not found
 */
router.get(
  "/:id",
  validationMiddleware(idCheckingSchema),
  asyncWrapper(getUserById)
);

/**
 * @swagger
 * /users/email/{email}:
 *   get:
 *     summary: Retrieve a user by email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/users/User'
 *       404:
 *         description: User not found
 */
router.get("/email/:email", asyncWrapper(getUserByEmail));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDto'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/users/User'
 *       400:
 *         description: Invalid input
 */
router.post("/", validationMiddleware(userSchema), createUser);

/**
 * @swagger
 * /users/upload/{userId}:
 *   post:
 *     summary: Upload a profile image for a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded and processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 processedImage:
 *                   type: object
 *       400:
 *         description: No file uploaded
 */
router.post(
  "/upload/:userId",
  upload.single("image"),
  asyncWrapper(uploadImage)
);

/**
 * @swagger
 * /users/delete/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.delete("/delete/:id", asyncWrapper(deleteUser));

export default router;

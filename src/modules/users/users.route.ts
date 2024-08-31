import { Router } from "express";
import {
  deleteUser,
  getUserByEmail,
  getUserById,
  getUsers,
} from "./users.controller";
import { createUser } from "./users.controller";
import { validationMiddleware } from "../../shared/middleware/validation.middleware";
import { userSchema } from "./schemas/user.schema";
import asyncWrapper from "../../shared/util/async-wrapper";
import { idCheckingSchema } from "./schemas/idChecking.schema";
import { emailCheckingSchema } from "../auth/schemas/email-checking.schema";

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
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: No users found
 */
router.get("/", asyncWrapper(getUsers));

/**
 * @swagger
 * /users/email:
 *
 *   get:
 *     summary: Get user by email
 *     description: Retrieve user details by email.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailCheckingSchema'
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.get(
  "/email",
  validationMiddleware(emailCheckingSchema),
  asyncWrapper(getUserByEmail)
);
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
 *               $ref: '#/components/schemas/User'
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
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 */
router.post("/", validationMiddleware(userSchema), createUser);

// /**
//  * @swagger
//  * /users/upload/{userId}:
//  *   post:
//  *     summary: Upload a profile image for a user
//  *     tags: [Users]
//  *     parameters:
//  *       - in: path
//  *         name: userId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               image:
//  *                 type: string
//  *                 format: binary
//  *     responses:
//  *       200:
//  *         description: Image uploaded and processed
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 processedImage:
//  *                   type: object
//  *       400:
//  *         description: No file uploaded
//  */
// router.post(
//   "/upload/:userId",
//   upload.single("image"),
//   asyncWrapper(uploadImage)
// );

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
router.delete(
  "/delete/:id",
  validationMiddleware(idCheckingSchema),
  asyncWrapper(deleteUser)
);

export default router;

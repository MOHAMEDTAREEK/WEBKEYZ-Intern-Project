import { Router } from "express";
import {
  deleteUser,
  getNumberOfPostsForUser,
  getUserByEmail,
  getUserById,
  getUserRecognitionNumber,
  getUsers,
  getUsersByMentionCount,
  searchUsers,
} from "./users.controller";
import { createUser } from "./users.controller";
import { validationMiddleware } from "../../shared/middleware/validation.middleware";
import { userSchema } from "./schemas/user.schema";
import asyncWrapper from "../../shared/util/async-wrapper";
import { idCheckingSchema } from "../../shared/helperSchemas/idChecking.schema";

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
 *         $ref: '#/responses/404'
 */
router.get("/", asyncWrapper(getUsers));

/**
 * @swagger
 * /users/leader-board:
 *   get:
 *     summary: Retrieve users sorted by mention count
 *     description: Fetch a list of users sorted by their mention count in descending order.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of users sorted by mention count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Users not found
 *       500:
 *         description: Internal server error
 */
router.get("/leader-board", asyncWrapper(getUsersByMentionCount));
/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search for users by first or last name
 *     description: Retrieve a list of users whose first or last name matches the search term.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         required: true
 *         description: The search term to find users by first or last name.
 *         example: "John"
 *     responses:
 *       200:
 *         description: A list of users matching the search term
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid search term
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Invalid search term."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

router.get("/search", asyncWrapper(searchUsers));

/**
 * @swagger
 * /users/recognition-number/{id}:
 *   get:
 *     summary: Get User Recognition Number
 *     description: Retrieve the recognition number of a user by their ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user.
 *     responses:
 *       200:
 *         description: Recognition number retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "User not found."
 */

router.get("/recognition-number/:id", asyncWrapper(getUserRecognitionNumber));

/**
 * @swagger
 * /users/post-number/{id}:
 *   get:
 *     summary: Get Number of Posts for a User
 *     description: Retrieve the number of posts made by a user identified by their ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user.
 *     responses:
 *       200:
 *         description: Number of posts retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "User not found."
 */
router.get("/post-number/:id", asyncWrapper(getNumberOfPostsForUser));
/**
 * @swagger
 * /users/email:
 *
 *   get:
 *     summary: Get user by email
 *     description: Retrieve user details by email.
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email of the user
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

router.get("/email", asyncWrapper(getUserByEmail));
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
 * /users/{id}:
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
  "/:id",
  validationMiddleware(idCheckingSchema),
  asyncWrapper(deleteUser)
);

export default router;

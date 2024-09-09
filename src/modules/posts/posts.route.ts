import { Router } from "express";
import {
  createPost,
  deletePost,
  fullyUpdatePost,
  getMentions,
  getPostById,
  getPosts,
  partiallyUpdatePost,
  uploadPostPhoto,
} from "./posts.controller";
import { validationMiddleware } from "../../shared/middleware/validation.middleware";
import { fullyUpdatePostSchema } from "./schemas/fullyUpdatePost.schema";
import { createPostSchema } from "./schemas/createPost.schema";
import { idCheckingSchema } from "../../shared/helperSchemas/idChecking.schema";
import { resizeImage } from "../../shared/middleware/image-preprocessing.middleware";
import upload, {
  uploadPhotos,
} from "../../shared/middleware/multer.middleware";
import asyncWrapper from "../../shared/util/async-wrapper";

const router = Router();

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Retrieve all posts
 *     description: Retrieves a list of all posts.
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: A list of posts.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/postSchema'
 *       404:
 *         description: No posts found
 */

router.get("/", asyncWrapper(getPosts));
/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Retrieve a post by ID
 *     description: Retrieves a post by its ID.
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post to retrieve
 *     responses:
 *       200:
 *         description: The post with the given ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/postSchema'
 *       404:
 *         description: Post not found
 */

router.get(
  "/:id",
  validationMiddleware(idCheckingSchema),
  asyncWrapper(getPostById)
);
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     description: Creates a new post with the provided data.
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               $ref: '#/components/schemas/createPostSchema'
 *     responses:
 *       201:
 *         description: The created post.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/postSchema'
 *       500:
 *         description: Internal server error
 */

router.post(
  "/",
  uploadPhotos,
  resizeImage,
  // validationMiddleware(createPostSchema),
  asyncWrapper(createPost)
);
/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Fully update a post
 *     description: Updates a post with new data.
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               $ref: '#/components/schemas/createPostSchema'
 *     responses:
 *       200:
 *         description: The updated post.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/postSchema'
 *       500:
 *         description: Internal server error
 */

router.put(
  "/:id",
  validationMiddleware(fullyUpdatePostSchema),
  asyncWrapper(fullyUpdatePost)
);
/**
 * @swagger
 * /posts/{id}:
 *   patch:
 *     summary: Partially update a post
 *     description: Updates a post partially based on the provided data.
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               $ref: '#/components/schemas/createPostSchema'
 *     responses:
 *       200:
 *         description: The partially updated post.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/postSchema'
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/:id",
  validationMiddleware(idCheckingSchema),
  asyncWrapper(partiallyUpdatePost)
);
/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Deletes a post by its ID.
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post to delete
 *     responses:
 *       200:
 *         description: The deleted post.
 *         content:
 *           application/json:
 *               $ref: '#/components/schemas/postSchema'
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  validationMiddleware(idCheckingSchema),
  asyncWrapper(deletePost)
);
/**
 * @swagger
 * /posts/upload:
 *   post:
 *     summary: Upload a photo for a post
 *     description: Uploads a photo for a post.
 *     tags:
 *       - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *               postId:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: The updated post with the uploaded photo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 description:
 *                   type: string
 *                 image:
 *                   type: string
 *       400:
 *         description: Bad request, no file uploaded
 *       500:
 *         description: Internal server error
 */
router.post(
  "/upload/:id",
  uploadPhotos,
  resizeImage,
  asyncWrapper(uploadPostPhoto)
);

router.get("/test/:id", asyncWrapper(getMentions));
/**
 * @swagger
 * /posts/mentions/{userId}:
 *   post:
 *     summary: Create a post with a mention
 *     description: Creates a new post and mentions a user.
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to mention
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               $ref: '#/components/schemas/createPostSchema'
 *     responses:
 *       200:
 *         description: The created post with mention information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/postSchema'
 *       500:
 *         description: Internal server error
 */

// router.post("/mentions/:userId", asyncWrapper(createPostWithMention));

export default router;

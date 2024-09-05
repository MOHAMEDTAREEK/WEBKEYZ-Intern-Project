import { Router } from "express";
import {
  createComment,
  deleteComment,
  fullyUpdateComment,
  getComments,
  partiallyUpdateComment,
} from "./comments.controller";
import { validationMiddleware } from "../../shared/middleware/validation.middleware";
import { fullyUpdateCommentSchema } from "./schemas/fullyUpdateComment.schema";
import { partiallyUpdateCommentSchema } from "./schemas/partiallyUpdateComment.schema";
import { idCheckingSchema } from "../../shared/helperSchemas/idChecking.schema";
import asyncWrapper from "../../shared/util/async-wrapper";
import { createCommentSchema } from "./schemas/create-comment.schema";

const router = Router();

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Retrieve all comments
 *     description: Fetches all comments from the database.
 *     tags:
 *       - Comments
 *     responses:
 *       200:
 *         description: A list of comments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   description:
 *                     type: string
 *       500:
 *         description: Internal server error
 */

router.get("/", asyncWrapper(getComments));
/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     description: Creates a new comment with the provided data.
 *     tags:
 *       - Comments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: 'This is a new comment'
 *               userId:
 *                 type: integer
 *                 example: 1
 *               postId:
 *                 type: integer
 *                 example: 42
 *             required:
 *               - description
 *               - userId
 *               - postId
 *     responses:
 *       200:
 *         description: The created comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 description:
 *                   type: string
 *                 userId:
 *                   type: integer
 *                 postId:
 *                   type: integer
 *               required:
 *                 - id
 *                 - description
 *                 - userId
 *                 - postId
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  validationMiddleware(createCommentSchema),
  asyncWrapper(createComment)
);
/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Fully update a comment
 *     description: Fully updates an existing comment by ID.
 *     tags:
 *       - Comments
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the comment to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: 'Updated comment description'
 *     responses:
 *       200:
 *         description: The updated comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 description:
 *                   type: string
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */

router.put(
  "/:id",
  validationMiddleware(fullyUpdateCommentSchema),
  asyncWrapper(fullyUpdateComment)
);
/**
 * @swagger
 * /comments/{id}:
 *   patch:
 *     summary: Partially update a comment
 *     description: Partially updates an existing comment by ID.
 *     tags:
 *       - Comments
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the comment to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: 'Updated comment description'
 *     responses:
 *       200:
 *         description: The updated comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 description:
 *                   type: string
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */

router.patch(
  "/:id",
  validationMiddleware(partiallyUpdateCommentSchema),
  asyncWrapper(partiallyUpdateComment)
);
/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Deletes an existing comment by ID.
 *     tags:
 *       - Comments
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the comment to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The deleted comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 description:
 *                   type: string
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */

router.delete(
  "/:id",
  validationMiddleware(idCheckingSchema),
  asyncWrapper(deleteComment)
);

export default router;

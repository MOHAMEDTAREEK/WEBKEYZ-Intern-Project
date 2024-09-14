import { Router } from "express";
import asyncWrapper from "../../shared/util/async-wrapper";
import {
  createNomination,
  getAllNominations,
  getTopNominatedUser,
  voteForUser,
} from "./nomination.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Nominations
 *   description: Nominations Management API
 */

/**
 * @swagger
 * /nominations:
 *   get:
 *     summary: Retrieve all nominations
 *     tags:
 *       - Nominations
 *     responses:
 *       200:
 *         description: Successfully retrieved all nominations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NominationSchema'
 *       500:
 *         description: Server error
 */
router.get("/", asyncWrapper(getAllNominations));
/**
 * @swagger
 * /nominations:
 *   post:
 *     summary: Create a new nomination
 *     tags:
 *       - Nominations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               $ref: '#/components/schemas/CreateNominationSchema'
 *     responses:
 *       201:
 *         description: Successfully created a new nomination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NominationSchema'
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post("/", asyncWrapper(createNomination));
/**
 * @swagger
 * /vote:
 *   post:
 *     summary: Submit a vote for a user
 *     tags:
 *       - Nominations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               $ref: '#/components/schemas/VoteForUserSchema'
 *     responses:
 *       201:
 *         description: Successfully submitted the vote
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/createdVoteForUser'
 *       400:
 *         description: User has already voted for this nomination
 *       500:
 *         description: Server error
 */
router.post("/vote", asyncWrapper(voteForUser));
/**
 * @swagger
 * /vote/top-nominated-user:
 *   get:
 *     summary: Retrieve the top-nominated user
 *     tags:
 *       - Nominations
 *     responses:
 *       200:
 *         description: Successfully retrieved the top-nominated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopNominatedUserSchema'
 *       500:
 *         description: Server error
 */
router.get("/vote/top-nominated-user", asyncWrapper(getTopNominatedUser));
export default router;

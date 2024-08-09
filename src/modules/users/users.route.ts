import { Router } from "express";
import { getUsers } from "./users.controller";
import { createUser } from "./users.controller";

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
router.post("/", createUser);

export default router;

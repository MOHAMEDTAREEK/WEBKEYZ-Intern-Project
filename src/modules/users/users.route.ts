import { Router } from "express";
import { getUsers } from "./users.controller";
import { createUser } from "./users.controller";

const router = Router();

router.get("/", getUsers);
router.post("/", createUser);

export default router;

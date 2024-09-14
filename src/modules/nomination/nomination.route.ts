import { Router } from "express";
import asyncWrapper from "../../shared/util/async-wrapper";
import {
  createNomination,
  getAllNominations,
  getTopNominatedUser,
  voteForUser,
} from "./nomination.controller";

const router = Router();

router.get("/", asyncWrapper(getAllNominations));
router.post("/", asyncWrapper(createNomination));
router.post("/vote", asyncWrapper(voteForUser));
router.get("/vote/top-nominated-user", asyncWrapper(getTopNominatedUser));
export default router;

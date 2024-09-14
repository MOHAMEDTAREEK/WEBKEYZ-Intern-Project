import { Request, Response } from "express";
import * as nominationService from "./nomination.service";
export const getAllNominations = async (req: Request, res: Response) => {
  const nominations = await nominationService.getAllNominations();

  res.json(nominations);
};

export const createNomination = async (req: Request, res: Response) => {
  const {
    nominationType,
    description,
    lastNominationDay,
    winnerAnnouncementDate,
  } = req.body;
  const nomination = await nominationService.createNomination(
    nominationType,
    description,
    lastNominationDay,
    winnerAnnouncementDate
  );
  res.json(nomination);
};

export const voteForUser = async (req: Request, res: Response) => {
  const { userId, nominatedUserId, nominationId } = req.body;
  const vote = await nominationService.voteForUser(
    userId,
    nominatedUserId,
    nominationId
  );
  res.json(vote);
};

export const getTopNominatedUser = async (req: Request, res: Response) => {
  const topNominatedUser = await nominationService.getTopNominatedUser();
  res.json(topNominatedUser);
};

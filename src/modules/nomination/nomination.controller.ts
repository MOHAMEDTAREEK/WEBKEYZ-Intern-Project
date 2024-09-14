import { Request, Response } from "express";
import * as nominationService from "./nomination.service";
import { IResponse } from "../../shared/interfaces/IResponse.interface";
import { createResponse } from "../../shared/util/create-response";
import { HttpStatusCode } from "axios";
import { SuccessMessage } from "../../shared/enums/constants/info-message.enum";
export const getAllNominations = async (req: Request, res: Response) => {
  const nominations = await nominationService.getAllNominations();

  const response: IResponse = createResponse(
    HttpStatusCode.Created,
    SuccessMessage.NOMINATIONS_RETRIEVED_SUCCESSFULLY,
    nominations
  );

  res.json(response);
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
  const response: IResponse = createResponse(
    HttpStatusCode.Created,
    SuccessMessage.NOMINATION_SUBMITTED_SUCCESSFULLY,
    nomination
  );

  res.json(response);
};

export const voteForUser = async (req: Request, res: Response) => {
  const { userId, nominatedUserId, nominationId } = req.body;
  const vote = await nominationService.voteForUser(
    userId,
    nominatedUserId,
    nominationId
  );
  const response: IResponse = createResponse(
    HttpStatusCode.Created,
    SuccessMessage.VOTE_SUBMITTED_SUCCESSFULLY,
    vote
  );

  res.json(response);
};

export const getTopNominatedUser = async (req: Request, res: Response) => {
  const topNominatedUser = await nominationService.getTopNominatedUser();

  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.WINNER_DATA_RETRIEVAL_SUCCESS,
    topNominatedUser
  );

  res.json(response);
};

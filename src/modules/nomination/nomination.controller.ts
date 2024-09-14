import { Request, Response } from "express";
import * as nominationService from "./nomination.service";
import { IResponse } from "../../shared/interfaces/IResponse.interface";
import { createResponse } from "../../shared/util/create-response";
import { HttpStatusCode } from "axios";
import { SuccessMessage } from "../../shared/enums/constants/info-message.enum";

/**
 * Retrieves all nominations and sends a response with the retrieved nominations.
 *
 * @param req - The request object.
 * @param res - The response object.
 */
export const getAllNominations = async (req: Request, res: Response) => {
  const nominations = await nominationService.getAllNominations();

  const response: IResponse = createResponse(
    HttpStatusCode.Created,
    SuccessMessage.NOMINATIONS_RETRIEVED_SUCCESSFULLY,
    nominations
  );

  res.json(response);
};

/**
 * Creates a new nomination based on the provided request data.
 *
 * @param {Request} req - The request object containing nomination details.
 * @param {Response} res - The response object to send back the result.
 * @returns {Promise<void>} A Promise that resolves when the nomination is created and the response is sent.
 */
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

/**
 * Handles the process of voting for a user.
 * Retrieves user, nominated user, and nomination IDs from the request body,
 * submits the vote using the nomination service, and returns a response with the result.
 * @param {Request} req - The request object containing user, nominated user, and nomination IDs.
 * @param {Response} res - The response object to send back the result of the vote submission.
 */
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

/**
 * Retrieves the top nominated user and sends a response with the user data.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} A Promise that resolves when the response is sent.
 */
export const getTopNominatedUser = async (req: Request, res: Response) => {
  const topNominatedUser = await nominationService.getTopNominatedUser();

  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.WINNER_DATA_RETRIEVAL_SUCCESS,
    topNominatedUser
  );

  res.json(response);
};

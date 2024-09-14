import { NominationType } from "../../shared/enums/nomination.type.enum";
import { getNominationTypePhoto } from "../../shared/util/nomination-type-photo-mapping";
import * as nominationRepository from "./nomination.repository";

/**
 * Asynchronously retrieves all nominations from the repository.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of all nominations.
 */
export const getAllNominations = async (): Promise<Array<any>> => {
  const nominations = await nominationRepository.getAllNominations();
  return nominations;
};

/**
 * Creates a new nomination entry with the provided details.
 *
 * @param {NominationType} nominationType - The type of nomination (e.g., BestEmployee, BestTeam).
 * @param {string} description - The description of the nomination.
 * @param {Date} lastNominationDay - The last day for nominations.
 * @param {Date} winnerAnnouncementDate - The date for announcing the winner.
 */
export const createNomination = async (
  nominationType: NominationType,
  description: string,
  lastNominationDay: Date,
  winnerAnnouncementDate: Date
) => {
  const nominationTypePhoto = getNominationTypePhoto(nominationType);
  const nomination = await nominationRepository.createNomination(
    nominationType,
    nominationTypePhoto,
    description,
    lastNominationDay,
    winnerAnnouncementDate
  );
  return nomination;
};

/**
 * Casts a vote for a nominated user by a specific user.
 *
 * @param userId The ID of the user casting the vote.
 * @param nominatedUserId The ID of the user being nominated.
 * @param nominationId The ID of the nomination for which the vote is cast.
 * @returns A promise that resolves with the vote result.
 */
export const voteForUser = async (
  userId: number,
  nominatedUserId: number,
  nominationId: number
) => {
  const vote = await nominationRepository.voteForUser(
    userId,
    nominatedUserId,
    nominationId
  );
  return vote;
};

/**
 * Retrieves the top nominated user asynchronously.
 *
 * @returns {Promise<any>} A promise that resolves with the top nominated user.
 */
export const getTopNominatedUser = async (): Promise<any> => {
  const topNominatedUser = await nominationRepository.getTopNominatedUser();
  return topNominatedUser;
};

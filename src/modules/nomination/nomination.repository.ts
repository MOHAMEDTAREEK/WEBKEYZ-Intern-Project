import { Sequelize } from "sequelize";
import NominationVote from "../../database/models/nomination-vote.model";
import Nomination from "../../database/models/nomination.model";
import { NominationType } from "../../shared/enums/nomination.type.enum";
import { BaseError } from "../../shared/exceptions/base.error";
import User from "../../database/models/user.model";
import { ErrorMessage } from "../../shared/enums/constants/error-message.enum";
import { HttpStatusCode } from "axios";
/**
 * Retrieves all nominations from the database in descending order of creation date.
 * @returns {Promise<Array<Nomination>>} A promise that resolves to an array of nominations.
 */
export const getAllNominations = async () => {
  const nominations = await Nomination.findAll({
    order: [["createdAt", "DESC"]],
  });
  return nominations;
};

/**
 * Creates a new nomination entry in the database.
 *
 * @param {NominationType} nominationType - The type of nomination (e.g., BestEmployee, BestTeam).
 * @param {string} nominationTypePhoto - The URL of the photo related to the nomination.
 * @param {string} description - A description of the nomination.
 * @param {Date} lastNominationDay - The deadline day for nominations.
 * @param {Date} winnerAnnouncementDate - The date when the winner will be announced.
 * @returns {Promise<Nomination>} The newly created nomination object.
 */
export const createNomination = async (
  nominationType: NominationType,
  nominationTypePhoto: string,
  description: string,
  lastNominationDay: Date,
  winnerAnnouncementDate: Date
) => {
  const nomination = await Nomination.create({
    nominationType: nominationType,
    photoUrl: nominationTypePhoto,
    description: description,
    lastNominationDay: lastNominationDay,
    winnerAnnouncementDate: winnerAnnouncementDate,
  });
  return nomination;
};

/**
 * Votes for a nominated user in a specific nomination.
 *
 * @param {number} userId - The ID of the user casting the vote.
 * @param {number} nominatedUserId - The ID of the user being nominated.
 * @param {number} nominationId - The ID of the nomination.
 * @returns {Promise<NominationVote>} The created vote for the nominated user.
 * @throws {BaseError} When the nomination post is not found or the user has already voted.
 */
export const voteForUser = async (
  userId: number,
  nominatedUserId: number,
  nominationId: number
) => {
  const existingNomination = await Nomination.findByPk(nominationId);
  if (!existingNomination) {
    throw new BaseError(
      ErrorMessage.NOMINATION_POST_NOT_FOUND,
      HttpStatusCode.BadRequest
    );
  }
  const existingVote = await NominationVote.findOne({
    where: { userId, nominationId },
  });
  if (existingVote) {
    throw new BaseError(
      ErrorMessage.USER_ALREADY_VOTED,
      HttpStatusCode.BadRequest
    );
  }
  const vote = await NominationVote.create({
    userId: userId,
    nominatedUserId: nominatedUserId,
    nominationId: nominationId,
  });
  return vote;
};

/**
 * Retrieves the top nominated user based on the number of nominations they have received.
 *
 * @returns {Promise<any>} The top nominated user with their details.
 */
export const getTopNominatedUser = async () => {
  const topNominatedUser = await NominationVote.findAll({
    attributes: [
      "nominated_user_id",
      [
        Sequelize.fn("COUNT", Sequelize.col("nominated_user_id")),
        "nominationCount",
      ],
    ],
    group: ["nominated_user_id"],
    order: [[Sequelize.literal("nominationCount"), "DESC"]],
    limit: 1,
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "profilePicture"],
      },
    ],
  });
  return topNominatedUser;
};

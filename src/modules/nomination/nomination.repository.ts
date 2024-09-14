import { Sequelize } from "sequelize";
import NominationVote from "../../database/models/nomination-vote.model";
import Nomination from "../../database/models/nomination.model";
import { NominationType } from "../../shared/enums/nomination.type.enum";
import { BaseError } from "../../shared/exceptions/base.error";
import User from "../../database/models/user.model";
import { ErrorMessage } from "../../shared/enums/constants/error-message.enum";
import { HttpStatusCode } from "axios";
export const getAllNominations = async () => {
  const nominations = await Nomination.findAll({
    order: [["createdAt", "DESC"]],
  });
  return nominations;
};

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

export const voteForUser = async (
  userId: number,
  nominatedUserId: number,
  nominationId: number
) => {
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

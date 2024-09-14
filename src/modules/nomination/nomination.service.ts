import { NominationType } from "../../shared/enums/nomination.type.enum";
import { getNominationTypePhoto } from "../../shared/util/nomination-type-photo-mapping";
import * as nominationRepository from "./nomination.repository";
export const getAllNominations = async () => {
  const nominations = await nominationRepository.getAllNominations();
  return nominations;
};

export const createNomination = async (
  nominationType: NominationType,
  description: string,
  lastNominationDay: Date,
  winnerAnnouncementDate: Date
) => {
  const nominationTypePhoto = getNominationTypePhoto(
    nominationType
  ) as unknown as Text;
  const nomination = await nominationRepository.createNomination(
    nominationType,
    nominationTypePhoto,
    description,
    lastNominationDay,
    winnerAnnouncementDate
  );
  return nomination;
};

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

export const getTopNominatedUser = async () => {
  const topNominatedUser = await nominationRepository.getTopNominatedUser();
  return topNominatedUser;
};

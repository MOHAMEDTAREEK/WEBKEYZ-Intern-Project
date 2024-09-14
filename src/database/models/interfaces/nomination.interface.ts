import { NominationType } from "../../../shared/enums/nomination.type.enum";

export interface NominationAttributes {
  id: number;
  nominationType: NominationType;
  photoUrl: string;
  description: string;
  lastNominationDay: Date;
  winnerAnnouncementDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NominationCreationAttributes
  extends Omit<NominationAttributes, "id"> {}

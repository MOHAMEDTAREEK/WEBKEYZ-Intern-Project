import { NominationType } from "../../../shared/enums/nomination.type.enum";

export interface NominationAttributes {
  id: number;
  nominationType: NominationType;
  photoUrl: Text;
  description: string;
  lastNominationDay: Date;
  winnerAnnouncementDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NominationCreationAttributes
  extends Omit<NominationAttributes, "id"> {}

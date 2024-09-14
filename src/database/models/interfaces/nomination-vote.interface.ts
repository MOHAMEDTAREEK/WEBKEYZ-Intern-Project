export interface NominationVoteAttributes {
  id: number;
  userId: number;
  nominatedUserId: number;
  nominationId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NominationVoteCreationAttributes
  extends Omit<NominationVoteAttributes, "id"> {}

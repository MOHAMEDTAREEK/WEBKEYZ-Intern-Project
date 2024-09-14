import { DataTypes, Model } from "sequelize";
import {
  NominationVoteAttributes,
  NominationVoteCreationAttributes,
} from "./interfaces/nomination-vote.interface";
import { sequelize } from ".";
import User from "./user.model";
import Nomination from "./nomination.model";

class NominationVote extends Model<
  NominationVoteAttributes,
  NominationVoteCreationAttributes
> {
  public id!: number;
  public userId!: number;
  public nominationId!: number;
  public createdAt?: Date;
  public updatedAt?: Date;
}

NominationVote.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "id",
      },
      field: "user_id",
    },
    nominatedUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "id",
      },
      field: "nominated_user_id",
    },
    nominationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "nomination",
        key: "id",
      },
      field: "nomination_id",
    },
  },
  {
    sequelize,
    modelName: "NominationVote",
    tableName: "nomination_vote",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "nomination_id"],
      },
    ],
  }
);

NominationVote.belongsTo(User, { foreignKey: "userId" });
NominationVote.belongsTo(User, { foreignKey: "nominatedUserId" });
NominationVote.belongsTo(Nomination, { foreignKey: "nominationId" });
export default NominationVote;

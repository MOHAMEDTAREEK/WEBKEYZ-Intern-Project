import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index";
import {
  NominationAttributes,
  NominationCreationAttributes,
} from "./interfaces/nomination.interface";
import { NominationType } from "../../shared/enums/nomination.type.enum";

class Nomination
  extends Model<NominationAttributes, NominationCreationAttributes>
  implements NominationAttributes
{
  public id!: number;
  public nominationType!: NominationType;
  public photoUrl!: Text;
  public description!: string;
  public lastNominationDay!: Date;
  public winnerAnnouncementDate!: Date;
  public createdAt?: Date;
  public updatedAt?: Date;
}

Nomination.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nominationType: {
      type: DataTypes.ENUM(
        NominationType.BestEmployee,
        NominationType.BestTeam
      ),
      allowNull: false,
      field: "nomination_type",
    },
    photoUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "photo_url",
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lastNominationDay: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "last_nomination_day",
    },
    winnerAnnouncementDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "winner_announcement_date",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    sequelize,
    modelName: "Nomination",
    tableName: "nomination",
    timestamps: true,
  }
);

export default Nomination;

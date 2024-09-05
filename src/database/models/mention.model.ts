import { Model, DataTypes } from "sequelize";
import { sequelize } from "./index";
import Post from "./post.model";
import User from "./user.model";
import {
  MentionAttributes,
  MentionCreationAttributes,
} from "./interfaces/mention.interface";
class Mention
  extends Model<MentionAttributes, MentionCreationAttributes>
  implements MentionAttributes
{
  public id!: number;
  public postId!: number;
  public mentionedUserId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Mention.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "post",
        key: "id",
      },
      field: "post_id",
    },
    mentionedUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "id",
      },
      field: "mentioned_user_id",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "mention",
    timestamps: true,
  }
);

Mention.belongsTo(Post, { foreignKey: "postId", as: "post" });
Mention.belongsTo(User, { foreignKey: "mentionedUserId", as: "mentionedUser" });

export default Mention;

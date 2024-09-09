import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index";
import User from "./user.model";
import Mention from "./mention.model";
import {
  PostAttributes,
  PostCreationAttributes,
} from "./interfaces/post.interface";
import { Json } from "sequelize/types/utils";
class Post
  extends Model<PostAttributes, PostCreationAttributes>
  implements PostAttributes
{
  public id!: number;
  public description!: string;
  public image?: String[];
  public userId!: number;
  public like!: number;
  public mentionedUser!: Json;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "User",
        key: "id",
      },
      field: "user_id",
      onDelete: "CASCADE",
    },
    like: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    mentionedUser: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "mentioned_user",
    },
  },
  {
    sequelize,
    tableName: "post",
    timestamps: true,
  }
);

User.hasMany(Post, { foreignKey: "userId", as: "post" });
Post.belongsTo(User, { foreignKey: "userId", as: "user" });

export default Post;

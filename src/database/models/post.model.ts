import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index";
import User from "./user.model";
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
  public image?: string[];
  public userId!: number;
  public like!: number;
  public pinnedPost!: boolean;
  public hashtag!: Json | string[];
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
    pinnedPost: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "pinned_post",
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
    hashtag: {
      type: DataTypes.JSON,
      allowNull: false,
      field: "hashtag",
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

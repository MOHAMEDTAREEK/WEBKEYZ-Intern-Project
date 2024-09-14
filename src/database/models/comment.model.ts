import { Model, DataTypes } from "sequelize";
import { sequelize } from "./index";
import Post from "./post.model";
import User from "./user.model";
import {
  CommentAttributes,
  CommentCreationAttributes,
} from "./interfaces/comment.interface";
class Comment
  extends Model<CommentAttributes, CommentCreationAttributes>
  implements CommentAttributes
{
  public id!: number;
  public description!: string;
  public userId!: number;
  public postId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Comment.init(
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
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "User",
        key: "id",
      },
      field: "user_id",
      onDelete: "CASCADE",
    },
    postId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Post",
        key: "id",
      },
      field: "post_id",
      onDelete: "CASCADE",
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
    tableName: "comment",
    timestamps: true,
  }
);

Post.hasMany(Comment, {
  foreignKey: "postId",
  as: "comment",
});
Comment.belongsTo(Post, {
  foreignKey: "postId",
  as: "post",
});
User.hasMany(Comment, {
  foreignKey: "userId",
  as: "comment",
});
Comment.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export default Comment;

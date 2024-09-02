import { Model, DataTypes } from "sequelize";
import { sequelize } from "./index";
import Post from "./post.model";
import User from "./user.model";

const Comment = sequelize.define(
  "Comment",
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
    tableName: "comment",
  }
);

Post.hasMany(Comment, {
  foreignKey: "postId",
  as: "comments",
});
Comment.belongsTo(Post, {
  foreignKey: "postId",
  as: "post",
});
User.hasMany(Comment, {
  foreignKey: "userId",
  as: "comments",
});
Comment.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
export default Comment;

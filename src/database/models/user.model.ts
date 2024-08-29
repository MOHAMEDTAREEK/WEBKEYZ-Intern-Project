import { DataTypes, Sequelize } from "sequelize";
import { sequelize } from "./index";
const User = sequelize.define(
  "User",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "last_name",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "profile_picture",
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "refresh_token",
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "reset_token",
    },
    role: {
      type: DataTypes.ENUM("admin", "hr", "user"),
      allowNull: false,
      defaultValue: "user",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("now"),
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("now"),
      field: "updated_at",
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: "google_id",
    },
  },
  {
    tableName: "user",
  }
);
export default User;

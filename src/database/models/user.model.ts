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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "hr", "user"),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("now"),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("now"),
    },
  },
  {
    tableName: "user",
  }
);

export default User;

import { DataTypes, Model, Sequelize } from "sequelize";
import { sequelize } from "./index";
import {
  UserAttributes,
  UserCreationAttributes,
} from "./interfaces/user.interface";
import Post from "./post.model";
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public firstName?: string;
  public lastName?: string;
  public email!: string;
  public password?: string;
  public profilePicture?: string;
  public refreshToken?: string;
  public resetToken?: string;
  public role!: "admin" | "hr" | "user";
  public createdAt!: Date;
  public updatedAt!: Date;
  public googleId?: string;
  public mentionCount!: number;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
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
    mentionCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: "mention_count",
    },
  },
  {
    sequelize,
    tableName: "user",
    timestamps: true,
  }
);
export default User;

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: true,
        field: "first_name",
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: true,
        field: "last_name",
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      profilePicture: {
        type: Sequelize.STRING,
        allowNull: true,
        field: "profile_picture",
      },
      refreshToken: {
        type: Sequelize.STRING,
        allowNull: true,
        field: "refresh_token",
      },
      resetToken: {
        type: Sequelize.STRING,
        allowNull: true,
        field: "reset_token",
      },
      role: {
        type: Sequelize.ENUM("admin", "hr", "user"),
        allowNull: false,
        defaultValue: "user",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
        field: "created_at",
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
        field: "updated_at",
      },
      googleId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        field: "google_id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("user");
  },
};

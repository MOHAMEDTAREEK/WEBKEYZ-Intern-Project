"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("nomination", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nominationType: {
        type: Sequelize.ENUM("BestEmployee", "BestTeam"),
        allowNull: false,
        field: "nomination_type",
      },
      photoUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
        field: "photo_url",
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastNominationDay: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "last_nomination_day",
      },
      winnerAnnouncementDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "winner_announcement_date",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "created_at",
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "updated_at",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("nomination");
  },
};

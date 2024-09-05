"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("post", "mentioned_User", {
      type: Sequelize.JSON,
      allowNull: true,
      field: "mentioned_User",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("post", "mentioned_User");
  },
};

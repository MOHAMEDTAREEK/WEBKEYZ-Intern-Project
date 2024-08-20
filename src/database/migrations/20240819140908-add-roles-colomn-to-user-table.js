"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("user", "role", {
      type: Sequelize.ENUM("admin", "hr", "user"),
      allowNull: false,
      defaultValue: "user",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("user", "role");
  },
};

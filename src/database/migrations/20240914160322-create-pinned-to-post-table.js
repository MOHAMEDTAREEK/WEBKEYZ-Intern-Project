"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("post", "pinned_post", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "pinned_post",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("post", "pinned_post");
  },
};

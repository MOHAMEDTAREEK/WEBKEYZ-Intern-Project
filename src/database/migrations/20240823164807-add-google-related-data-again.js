"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("user", "firstName", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("user", "lastName", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("user", "password", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("user", "profilePicture", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.removeColumn("user", "name");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("user", "firstName", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("user", "lastName", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("user", "password", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("user", "profilePicture", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn("user", "columnName", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};

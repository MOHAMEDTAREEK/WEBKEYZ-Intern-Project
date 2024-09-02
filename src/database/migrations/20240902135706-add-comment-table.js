"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("comment", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "user",
          key: "id",
        },
        onDelete: "CASCADE",
        field: "user_id",
      },
      postId: {
        type: Sequelize.INTEGER,
        references: {
          model: "post",
          key: "id",
        },
        onDelete: "CASCADE",
        field: "post_id",
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
    await queryInterface.addConstraint("comment", {
      fields: ["user_id"],
      type: "foreign key",
      name: "comments_user_id_fk",
      references: {
        table: "user",
        field: "id",
      },
      onDelete: "CASCADE",
    });
    await queryInterface.addConstraint("comment", {
      fields: ["post_id"],
      type: "foreign key",
      name: "comments_post_id_fk",
      references: {
        table: "post",
        field: "id",
      },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("comments");
  },
};

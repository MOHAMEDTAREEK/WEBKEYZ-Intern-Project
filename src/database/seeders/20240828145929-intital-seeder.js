"use strict";

const e = require("express");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert(
      "user",
      [
        {
          id: 1,
          first_name: "Shrok",
          last_name: "Ayman",
          password:
            "$2b$10$dS.q.ZreZ/mwRBh7DQzZoOUpGqKi1BAiPkLhB50H2XmCD/jq3d.Fm",
          email: "shrok@gmail.com",
          role: "user",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { ignoreDuplicates: true }
    );
  },
  down: async (queryInterface) => {
    // Remove seeded data
    return queryInterface.bulkDelete("user", null, {});
  },
};

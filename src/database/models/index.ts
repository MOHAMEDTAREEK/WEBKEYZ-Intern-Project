import { Sequelize } from "sequelize";
import path from "path";

/**
 * Initializes a Sequelize instance based on the environment configuration.
 * @remarks
 * If a URL is provided in the configuration, a Sequelize instance is created using the URL; otherwise, the database, username, password, and other configuration details are used.
 */
const env = process.env.NODE_ENV || "development";
const configPath = path.join(__dirname, "../../../dbconfig/config.json");
const config = require(configPath)[env];

const sequelize = config.url
  ? new Sequelize(config.url, {
      ...config,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize(config.database, config.username, config.password, {
      ...config,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

export { Sequelize, sequelize };

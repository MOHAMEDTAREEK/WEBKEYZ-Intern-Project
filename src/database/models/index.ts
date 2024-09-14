import { Sequelize } from "sequelize";
import config from "../../config/config";

/**
 * Initializes a Sequelize instance based on the environment configuration.
 * @remarks
 * If a URL is provided in the configuration, a Sequelize instance is created using the URL; otherwise, the database, username, password, and other configuration details are used.
 */

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    ...config,
  }
);

export { Sequelize, sequelize };

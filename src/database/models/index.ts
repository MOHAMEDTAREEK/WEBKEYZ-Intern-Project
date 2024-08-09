import { Sequelize } from "sequelize";
import path from "path";

const env = process.env.NODE_ENV || "development";
const configPath = path.join(__dirname, "../../../dbconfig/config.json");
const config = require(configPath)[env];

const sequelize = config.url
  ? new Sequelize(config.url, config)
  : new Sequelize(config.database, config.username, config.password, config);

export { Sequelize, sequelize };

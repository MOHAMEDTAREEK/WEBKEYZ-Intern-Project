require("dotenv").config();

const defaultConfig = {
  username: process.env.DB_USER_NAME,
  password: process.env.DB_USER_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: 3306,
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    decimalNumbers: true,
  },
  Pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    charset: "utf8",
    timestamps: true,
    freezeTableName: true,
  },
};

const configuration = {
  development: {
    ...defaultConfig,
    logging: false, // console.log
  },
  local: {
    ...defaultConfig,
    logging: false,
  },
  test: defaultConfig,
};
const env = process.env.NODE_ENV || "development";

module.exports = configuration[env];

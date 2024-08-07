import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8080",
  },
  db: {
    url: process.env.DB_URL,
  },
};

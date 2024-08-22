import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:8080",
  },

  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: 1000 * 60 * 15, // 15 minutes
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: 1000 * 60 * 60 * 24 * 7 * 4, // 4 weeks
  },
  cookieSecret: process.env.COOKIE_SECRET,
  resetToken: {
    secret: process.env.JWT_RESET_SECRET,
    expiresIn: "1h",
  },
};

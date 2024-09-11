import { Application } from "express";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import config from "../config";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "../config/passport";
import swaggerUI from "swagger-ui-express";
import swaggerSpec from "../config/swagger";

/**
 * Middleware loader function to set up various middleware for the Express application.
 * @param {Application} app - The Express application instance.
 */
export const middlewareLoader = async (app: Application) => {
  app.use(
    cors({
      origin: config.cors.origin,
    })
  );
  app.use(morgan("dev"));
  app.use(helmet());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(
    cookieParser(config.cookieSecret, {
      httpOnly: true,
      signed: true,
    } as cookieParser.CookieParseOptions)
  );
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
};

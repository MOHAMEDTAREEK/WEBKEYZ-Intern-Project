import { Application } from "express";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import config from "../config";
import cookieParser from "cookie-parser";
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
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use(helmet());
  app.use(
    cookieParser(config.cookieSecret, {
      httpOnly: true,
      signed: true,
    } as cookieParser.CookieParseOptions)
  );
};

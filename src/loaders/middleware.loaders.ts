import { Application } from "express";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import config from "../config";
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
  
};

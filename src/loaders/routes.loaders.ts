import { Application } from "express";
import usersRouter from "../modules/users/users.route";
import authRouter from "../modules/auth/auth.route";

/**
 * Loads routes for the Express application.
 * Attaches the usersRouter to the "/users" endpoint.
 *
 * @param {Application} app - The Express application instance.
 */
export const routesLoader = async (app: Application) => {
  app.use("/users", usersRouter);
  app.use("/auth", authRouter);
};

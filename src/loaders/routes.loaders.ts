import { Application } from "express";
import usersRouter from "../modules/users/users.route";

export const routesLoader = async (app: Application) => {
  app.use("/users", usersRouter);
};

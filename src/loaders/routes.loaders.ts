import { Application } from "express";
import usersRouter from "../modules/users/users.route";
import authRouter from "../modules/auth/auth.route";
import postRouter from "../modules/posts/posts.route";
import commentsRouter from "../modules/comments/comments.route";
import nominationRouter from "../modules/nomination/nomination.route";

/**
 * Loads routes for the Express application.
 * Attaches the usersRouter to the "/users" endpoint.
 *
 * @param {Application} app - The Express application instance.
 */
export const routesLoader = async (app: Application) => {
  app.use("/users", usersRouter);
  app.use("/auth", authRouter);
  app.use("/posts", postRouter);
  app.use("/comments", commentsRouter);
  app.use("/nominations", nominationRouter);
};

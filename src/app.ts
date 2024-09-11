import express from "express";
import { routesLoader } from "./loaders/routes.loaders";
import logger from "./shared/util/logger";
import { errorHandlerMiddleware } from "./shared/middleware/error-Handler.middleware";
import { sequelizeErrorHandlerMiddleware } from "./shared/middleware/Sequelize-Error-Handler.middleware";
import { middlewareLoader } from "./loaders/middleware.loaders";

/**
 * Starts the server and listens for incoming requests.
 *
 * @returns  A promise that resolves when the server is started.
 */
const startServer = async () => {
  const app = express();
  const port = process.env.PORT || 3000;

  middlewareLoader(app);
  routesLoader(app);

  app.use(sequelizeErrorHandlerMiddleware);
  app.use(errorHandlerMiddleware);

  app.listen(port, () => {
    logger.info(`Server listening at http://localhost:${port}`);
    logger.info(`Swagger available at http://localhost:${port}/api-docs`);
  });
};

startServer();

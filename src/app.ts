import express from "express";
import { routesLoader } from "./loaders/routes.loaders";
import logger from "./shared/util/logger";
import { errorHandlerMiddleware } from "./shared/middleware/error-Handler.middleware";
import { sequelizeErrorHandlerMiddleware } from "./shared/middleware/Sequelize-Error-Handler.middleware";
import swaggerUI from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import { middlewareLoader } from "./loaders/middleware.loaders";

const startServer = async () => {
  const app = express();
  const port = process.env.PORT;

  middlewareLoader(app);
  routesLoader(app);

  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

  app.use(sequelizeErrorHandlerMiddleware);
  app.use(errorHandlerMiddleware);

  app.listen(port, () => {
    logger.info(`Server listening at http://localhost:${port}`);
    logger.info(`Swagger available at http://localhost:${port}/api-docs`);
  });
};

startServer();

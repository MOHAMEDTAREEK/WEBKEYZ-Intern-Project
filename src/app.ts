import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import config from "./config";
import { routesLoader } from "./loaders/routes.loaders";
import logger from "./shared/util/logger";
import { errorHandlerMiddleware } from "./shared/middleware/error-Handler.middleware";
import { sequelizeErrorHandlerMiddleware } from "./shared/middleware/Sequelize-Error-Handler.middleware";
import swaggerUI from "swagger-ui-express";
import swaggerSpec from "./config/swagger";

const startServer = async () => {
  const app = express();
  const port = process.env.PORT;

  app.use(
    cors({
      origin: config.cors.origin,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use(helmet());

  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

  routesLoader(app);

  app.use(sequelizeErrorHandlerMiddleware);
  app.use(errorHandlerMiddleware);

  app.listen(port, () => {
    logger.info(`Server listening at http://localhost:${port}`);
    logger.info(`Swagger available at http://localhost:${port}/api-docs`);
  });
};

startServer();

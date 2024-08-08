import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import config from "./config";
import { routesLoader } from "./loaders/routes.loaders";
import logger from "./shared/util/logger";
import { errorHandlerMiddleware } from "./shared/middleware/error-Handler.middleware";
import { sequelizeErrorHandlerMiddleware } from "./shared/middleware/Sequelize-Error-Handler.middleware";

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

  routesLoader(app);

  app.use(sequelizeErrorHandlerMiddleware);
  app.use(errorHandlerMiddleware);

  app.listen(port, () => {
    logger.info(`Server listening at http://localhost:${port}`);
  });
};

startServer();

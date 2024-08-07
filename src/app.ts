import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import config from "./config";
import sequelize from "./shared/db/model";
import { routesLoader } from "./loaders/routes.loaders";

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

  app.listen(port, () => {
    console.log(`Server is running on ${port}`);
  });
};

startServer();

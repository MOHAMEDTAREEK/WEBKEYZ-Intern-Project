import swaggerJSDoc, { Options } from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0",
    description: "My API Description",
  },
};

const options: Options = {
  swaggerDefinition,
  apis: ["./src/modules/**/*.route.ts"],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;

import swaggerJSDoc, { Options } from "swagger-jsdoc";
/**
 * Generates and exports the Swagger specification for the API.
 */

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0",
    description: "My API Description",
  },
  components: {
    schemas: {
      RegisterSchema: {
        type: "object",
        required: ["email", "password", "name"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
          name: { type: "string", example: "John Doe" },
        },
      },
      LoginSchema: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
        },
      },
      EmailCheckingSchema: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
        },
      },
      ResetPasswordSchema: {
        type: "object",
        required: ["password"],
        properties: {
          password: { type: "string", format: "password" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          email: {
            type: "string",
            example: "user@example.com",
          },
          name: {
            type: "string",
            example: "John Doe",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2024-08-26T12:00:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2024-08-26T12:00:00Z",
          },
        },
      },
      CreateUserDto: {
        type: "object",
        required: ["email", "password", "firstName", "lastName"],
        properties: {
          email: {
            type: "string",
            example: "user@example.com",
          },
          password: {
            type: "string",
            example: "password123",
          },
          firstName: {
            type: "string",
            example: "John ",
          },
          lastName: {
            type: "string",
            example: "Doe",
          },
        },
      },
    },
  },
  host: "localhost:3000",
};

const options: Options = {
  swaggerDefinition,
  apis: ["./*/modules/**/*.route.ts"],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;

import swaggerJSDoc, { Options } from "swagger-jsdoc";
/**
 * Generates and exports the Swagger specification for the API.
 */

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "WebKeyz Intern",
    version: "1.0.0",
    description: "WebKeyz Sociaty APIs",
  },
  components: {
    cookieAuth: {
      type: "apiKey",
      in: "cookie",
      name: "accessToken",
      description: "JWT token used for authentication stored in cookies",
    },

    schemas: {
      RegisterSchema: {
        type: "object",
        required: ["firstName", "lastName", "email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
          firstName: { type: "string", example: "John" },
          lastName: { type: "string", example: "Doe" },
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
        required: ["password", "email"],
        properties: {
          password: { type: "string", format: "password" },
          email: { type: "string", format: "email" },
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
      UserEmail: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
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
            example: "John",
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

let path = "./*/modules/**/*.route.js";

if (process.env.NODE_ENV === "local") {
  path = "./*/modules/**/*.route.ts";
} else {
  path = path;
}
const options: Options = {
  swaggerDefinition,
  apis: [path],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;

import { response } from "express";
import swaggerJSDoc, { Options } from "swagger-jsdoc";
import { createPost } from "../modules/posts/posts.repository";
import { stat } from "fs";
/**
 * Generates and exports the Swagger specification for the API.
 */

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "WebKeyz Intern",
    version: "1.0.0",
    description: "WebKeyz Society APIs",
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
      commentSchema: {
        type: "object",
        required: ["description", "userId", "postId"],
        properties: {
          description: { type: "string", example: "This is a comment" },
          userId: { type: "integer", example: 1 },
          postId: { type: "integer", example: 1 },
        },
      },
      updateCommentSchema: {
        type: "object",
        required: ["description", "image"],
        properties: {
          description: {
            type: "string",
            example: "This is a updated comment",
          },
          image: {
            type: "string",
            format: "link",
            description: "Image file to upload",
          },
        },
      },
      postSchema: {
        type: "object",
        required: ["description", "image", "mentionedUsers"],
        properties: {
          description: {
            type: "string",
            example: "This is a post",
          },
          image: {
            type: "string",
            format: "link",
            description: "Image file to upload",
          },
          mentionedUsers: {
            type: "array",
            items: {
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
                firstName: {
                  type: "string",
                  example: "John ",
                },
                lastName: {
                  type: "string",
                  example: "Doe",
                },
                role: {
                  type: "string",
                  example: "user",
                },
                profilePicture: {
                  type: "string",
                  format: "link",
                  description: "example.com/image.jpg",
                },
              },
            },
          },
        },
      },
      updatePostSchema: {
        type: "object",
        required: ["description", "image"],
        properties: {
          description: {
            type: "string",
            example: "This is a post",
          },
          image: {
            type: "string",
            format: "link",
            description: "Image file to upload",
          },
        },
      },
      createPostSchema: {
        type: "object",
        required: ["description", "userId", "postPhoto"],
        properties: {
          description: {
            type: "string",
            example: "This is a post",
          },
          postPhoto: {
            type: "array",
            items: { type: "string", format: "binary" },
            description: " Up to 2 image files to be uploaded",
          },
          userId: {
            type: "integer",
            example: 1,
          },
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
          firstName: {
            type: "string",
            example: "John ",
          },
          lastName: {
            type: "string",
            example: "Doe",
          },
          role: {
            type: "string",
            example: "user",
          },
          profilePicture: {
            type: "string",
            format: "link",
            description: "Image file to upload",
          },
          mentionCount: {
            type: "integer",
            example: 1,
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
      NominationSchema: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          nominationType: {
            type: "enum",
            example: "BestEmployee",
          },
          photoUrl: {
            type: "string",
            format: "link",
            description: "https://example.com/photos/best_employee.jpg",
          },
          description: {
            type: "string",
            example: "Best Employee of the month",
          },
          lastNominationDay: {
            type: "string",
            format: "date",
            example: "2023-06-10",
          },
          winnerAnnouncementDate: {
            type: "string",
            format: "date",
            example: "2023-06-15",
          },
        },
      },
      CreateNominationSchema: {
        type: "object",
        required: [
          "nominationType",
          "photoUrl",
          "description",
          "lastNominationDay",
          "winnerAnnouncementDate",
        ],
        properties: {
          nominationType: {
            type: "enum",
            example: "BestEmployee",
          },
          description: {
            type: "string",
            example: "Best Employee of the month",
          },
          lastNominationDay: {
            type: "string",
            format: "date",
            example: "2023-06-10",
          },
          winnerAnnouncementDate: {
            type: "string",
            format: "date",
            example: "2023-06-15",
          },
        },
      },
      VoteForUserSchema: {
        type: "object",
        required: ["userId", "nominatedUserId", "nominationId"],
        properties: {
          userId: {
            type: "integer",
            example: 1,
          },
          nominatedUserId: {
            type: "integer",
            example: 2,
          },
          nominationId: {
            type: "integer",
            example: 1,
          },
        },
      },
      createdVoteForUser: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          userId: {
            type: "integer",
            example: 1,
          },
          nominatedUserId: {
            type: "integer",
            example: 2,
          },
          nominationId: {
            type: "integer",
            example: 1,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2023-06-10T12:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2023-06-10T12:00:00.000Z",
          },
        },
      },
      TopNominatedUserSchema: {
        type: "object",
        properties: {
          nominatedUserId: {
            type: "integer",
            example: 1,
          },
          nominationCount: {
            type: "integer",
            example: 1,
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
              firstName: {
                type: "string",
                example: "John",
              },
              lastName: {
                type: "string",
                example: "Doe",
              },
              profilePicture: {
                type: "string",
                format: "link",
                description: "https://example.com/photos/profile.jpg",
              },
            },
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Success",
              },
            },
          },
        },
      },
    },
    201: {
      description: "Created",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Created",
              },
            },
          },
        },
      },
    },
    400: {
      description: "Bad Request",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Bad Request",
              },
            },
          },
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Unauthorized",
              },
            },
          },
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Forbidden",
              },
            },
          },
        },
      },
    },
    404: {
      description: "Not Found",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Not Found",
              },
              statusCode: {
                type: "integer",
                example: 404,
              },
            },
          },
        },
      },
    },
    500: {
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Internal Server Error",
              },
            },
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

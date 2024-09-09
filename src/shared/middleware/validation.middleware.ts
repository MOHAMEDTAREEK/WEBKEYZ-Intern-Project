import { Request, Response, NextFunction } from "express";
import Joi from "joi";

type ValidationTargets = {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
};

const validationErrors: string[] = [];

/**
 * Validates a specific part of data against a Joi schema.
 *
 * @param schema The Joi schema to validate against.
 * @param data The data to be validated.
 * @param part A string indicating the part of data being validated.
 */ const validatePart = (
  schema: Joi.ObjectSchema | undefined,
  data: any,
  part: string
) => {
  if (schema) {
    const { error } = schema.validate(data, { abortEarly: true });
    if (error) {
      validationErrors.push(
        ...error.details.map((detail) => `${part}: ${detail.message}`)
      );
    }
  }
};

/**
 * Middleware function that validates the request data based on the provided schemas.
 * @param schemas Object containing Joi schemas for request body, parameters, and query
 * @returns Express middleware function to handle request validation
 */
export const validationMiddleware = (schemas: ValidationTargets) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Validate each part of the request
    validatePart(schemas.body, req.body, "body");
    validatePart(schemas.params, req.params, "params");
    validatePart(schemas.query, req.query, "query");

    // If there are validation errors, respond with 400 and the detailed error messages
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    next();
  };
};

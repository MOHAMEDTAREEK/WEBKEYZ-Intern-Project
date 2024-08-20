import { Request, Response, NextFunction } from "express";
import Joi from "joi";

type ValidationTargets = {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
};

export const validationMiddleware = (schemas: ValidationTargets) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: string[] = [];

    // Utility function to validate a specific part of the request
    const validatePart = (
      schema: Joi.ObjectSchema | undefined,
      data: any,
      part: string
    ) => {
      if (schema) {
        const { error } = schema.validate(data, { abortEarly: false });
        if (error) {
          validationErrors.push(
            ...error.details.map((detail) => `${part}: ${detail.message}`)
          );
        }
      }
    };

    // Validate each part of the request
    validatePart(schemas.body, req.body, "body");
    validatePart(schemas.params, req.params, "params");
    validatePart(schemas.query, req.query, "query");

    // If there are validation errors, respond with 400 and the detailed error messages
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // Proceed to the next middleware or route handler if validation passes
    next();
  };
};

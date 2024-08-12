import { Request, Response, NextFunction } from "express";
import Joi from "joi";

/**
 * Middleware function that validates data in the request object based on a Joi schema.
 * If validation fails, it sends a response with error details; otherwise, it proceeds to the next middleware.
 *
 * @param schema - The Joi schema used for validation.
 * @param target - The target location in the request object where the data to validate is located (default is "body").
 */
type ValidationTarget = "body" | "params" | "query";

export const validationMiddleware = (
  schema: Joi.ObjectSchema,
  target: ValidationTarget = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req[target];
    const { error } = schema.validate(dataToValidate, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ errors });
    }

    next();
  };
};

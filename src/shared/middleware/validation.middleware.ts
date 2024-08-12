import { Request, Response, NextFunction } from "express";
import Joi from "joi";

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

import Joi from "joi";

export const resetPasswordSchema = {
  body: Joi.object({
    password: Joi.string().required(),
    email: Joi.string().email().optional(),
  }),
  params: Joi.object({
    token: Joi.string().optional(),
  }),
};

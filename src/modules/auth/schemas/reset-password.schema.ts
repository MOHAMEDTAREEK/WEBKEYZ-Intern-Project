import Joi from "joi";

export const resetPasswordSchema = {
  body: Joi.object({
    password: Joi.string().required(),
  }),
  params: Joi.object({
    token: Joi.string().optional(),
  }),
};

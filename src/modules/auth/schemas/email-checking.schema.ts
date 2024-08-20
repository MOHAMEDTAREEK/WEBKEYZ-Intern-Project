import Joi from "joi";

export const emailCheckingSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

import joi from "joi";

export const userSchema = {
  body: joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    role: joi.string().valid("admin", "hr", "user").optional(),
  }),
};

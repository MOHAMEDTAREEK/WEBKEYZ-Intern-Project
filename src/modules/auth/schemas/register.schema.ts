import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roles: Joi.string().valid("admin", "hr", "user").required(),
});

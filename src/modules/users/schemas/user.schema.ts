import joi from "joi";

export const userSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  roles: joi.string().valid("admin", "hr", "user").required(),
});

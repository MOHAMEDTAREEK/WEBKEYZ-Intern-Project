import joi from "joi";

export const userSchema = {
  body: joi.object({
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    role: joi.string().valid("admin", "hr", "user").optional(),
    profilePicture: joi.string().optional(),
  }),
};

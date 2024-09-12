import joi from "joi";

export const createPostSchema = {
  body: joi.object({
    description: joi.string().min(70).max(900).required(),
    userId: joi.number().integer().positive().required(),
  }),
};

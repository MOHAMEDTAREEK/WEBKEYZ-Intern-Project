import joi from "joi";

export const createPostSchema = {
  body: joi.object({
    description: joi.string().required(),
    image: joi.string().required(),
    userId: joi.number().required(),
  }),
};

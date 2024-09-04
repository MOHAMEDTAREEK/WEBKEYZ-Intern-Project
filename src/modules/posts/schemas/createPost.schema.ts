import Joi from "joi";

export const createPostSchema = {
  body: Joi.object({
    description: Joi.string().required(),
    image: Joi.string().required(),
    userId: Joi.number().required(),
  }),
};

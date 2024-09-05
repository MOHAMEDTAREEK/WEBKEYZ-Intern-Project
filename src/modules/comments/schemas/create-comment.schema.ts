import Joi from "joi";

export const createCommentSchema = {
  body: Joi.object({
    description: Joi.string().required(),
    postId: Joi.number().required(),
    userId: Joi.number().required(),
  }),
};

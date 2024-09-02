import joi from "joi";

export const fullyUpdateCommentSchema = {
  body: joi.object({
    description: joi.string().required(),
  }),
};

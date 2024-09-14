import joi from "joi";

export const partiallyUpdateCommentSchema = {
  body: joi.object({
    description: joi.string().optional(),
  }),
};

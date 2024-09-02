import joi from "joi";

export const partiallyUpdatePostSchema = {
  body: joi.object({
    description: joi.string().optional(),
    image: joi.string().optional(),
  }),
};

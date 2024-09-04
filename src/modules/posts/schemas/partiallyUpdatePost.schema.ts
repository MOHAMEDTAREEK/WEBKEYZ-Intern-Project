import joi from "joi";

export const partiallyUpdatePostSchema = {
  params: joi.object({
    id: joi.number().required(),
  }),
  body: joi.object({
    description: joi.string().optional(),
    image: joi.string().optional(),
  }),
};

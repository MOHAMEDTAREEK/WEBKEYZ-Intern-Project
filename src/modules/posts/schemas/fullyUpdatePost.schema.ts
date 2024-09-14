import joi from "joi";

export const fullyUpdatePostSchema = {
  params: joi.object({
    id: joi.number().required(),
  }),
  body: joi.object({
    description: joi.string().required(),
    image: joi.string().required(),
  }),
};

import joi from "joi";

export const fullyUpdatePostSchema = {
  body: joi.object({
    description: joi.string().required(),
    image: joi.string().required(),
  }),
};

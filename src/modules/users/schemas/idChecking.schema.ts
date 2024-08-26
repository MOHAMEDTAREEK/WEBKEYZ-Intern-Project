import joi from "joi";
export const idCheckingSchema = {
  params: joi.object({
    id: joi.number().required(),
  }),
};

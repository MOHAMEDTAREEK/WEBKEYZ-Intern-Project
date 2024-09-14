import Joi from "joi";

export const googleAccessTokenSchema = {
  body: Joi.object({
    idToken: Joi.string().required(),
  }),
};

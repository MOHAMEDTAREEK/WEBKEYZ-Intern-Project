import Joi from "joi";

export const googleRefreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

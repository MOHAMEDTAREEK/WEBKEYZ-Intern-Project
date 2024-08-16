import Joi from "joi";

export const refreshTokensSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

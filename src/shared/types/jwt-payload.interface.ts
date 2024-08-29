/**
 * Interface for JWT payload containing user information.
 * @property {number} sub - Subject identifier.
 * @property {string} email - User's email address.
 * @property {number} [exp] - Expiration time of the token.
 * @property {number} [iat] - Time at which the token was issued.
 */

export interface JwtPayload {
  sub: number;
  email: string;
  exp?: number;
  iat?: number;
}

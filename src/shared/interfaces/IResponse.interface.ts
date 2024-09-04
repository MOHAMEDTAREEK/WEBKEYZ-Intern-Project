import { HttpStatusCode } from "axios";

/**
 * Represents the structure of a response object.
 * @interface
 * @property {HttpStatusCode} internalStatusCode - The internal status code of the response.
 * @property {string} message - The message associated with the response.
 * @property {any} [data] - Optional data payload of the response.
 * @property {Array<string>} [errors] - Optional array of error messages.
 * @property {Object} [dev] - Optional development information.
 * @property {string} dev.errType - The type of error in development.
 * @property {string} dev.errMsg - The error message in development.
 * @property {string} dev.errTrace - The error trace in development.
 * @property {any} dev.apiError - Additional API error details in development.
 */

export interface IResponse {
  internalStatusCode: HttpStatusCode;
  message: string;
  data?: any;
  errors?: Array<string>;
  dev?: {
    errType: string;
    errMsg: string;
    errTrace: string;
    apiError: any;
  };
}

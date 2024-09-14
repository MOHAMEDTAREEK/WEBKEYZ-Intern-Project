import { HttpStatusCode } from "axios";
import { IResponse } from "../interfaces/IResponse.interface";

/**
 * Creates a response object with the provided status code, message, data, errors, and dev data.
 *
 * @param statusCode - The HTTP status code for the response.
 * @param message - The message to be included in the response.
 * @param data - Optional data to be sent in the response.
 * @param errors - Optional array of error messages.
 * @param dev - Optional developer-specific data.
 * @returns An object conforming to the IResponse interface with the provided details.
 */
export const createResponse = (
  statusCode: HttpStatusCode,
  message: string,
  data?: any,
  errors?: Array<string>,
  dev?: any
): IResponse => {
  return {
    internalStatusCode: statusCode,
    message,
    data,
    errors,
    dev,
  };
};

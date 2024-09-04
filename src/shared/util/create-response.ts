import { HttpStatusCode } from "axios";
import { IResponse } from "../interfaces/IResponse.interface";

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

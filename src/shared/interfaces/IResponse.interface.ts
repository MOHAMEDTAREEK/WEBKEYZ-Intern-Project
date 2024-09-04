import { HttpStatusCode } from "axios";

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

import { HttpStatusCode } from "axios";

/**
 * Represents a custom error class that extends the built-in Error class.
 * @param response The error response message.
 * @param status The HTTP status code associated with the error.
 */
export class BaseError extends Error {
  public response: string;
  public status: HttpStatusCode;

  constructor(response: string, status: HttpStatusCode) {
    {
      super(response);
      this.response = response;
      this.status = status;
    }
  }
}

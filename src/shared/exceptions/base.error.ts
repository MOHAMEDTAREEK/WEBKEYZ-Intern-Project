import { HttpStatus } from "../enums/http-Status.enum";

/**
 * Represents a custom error class that extends the built-in Error class.
 * @param response The error response message.
 * @param status The HTTP status code associated with the error.
 */
export class BaseError extends Error {
  public response: string;
  public status: HttpStatus;

  constructor(response: string, status: HttpStatus) {
    {
      super(response);
      this.response = response;
      this.status = status;
    }
  }
}

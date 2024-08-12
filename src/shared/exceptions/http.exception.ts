import { HttpStatus } from "../enums/http-Status.enum";

export class HttpException extends Error {
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

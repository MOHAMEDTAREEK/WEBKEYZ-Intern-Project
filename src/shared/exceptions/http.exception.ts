import { HttpStatus } from "../enums/http-Status.enum";

export class HttpException extends Error {
  public status: HttpStatus;
  public response: string;
  public details: any;

  constructor(status: HttpStatus, response: string) {
    {
      super(response);
      this.status = status;
      this.response = response;
    }
  }
}

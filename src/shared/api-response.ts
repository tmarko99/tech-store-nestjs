/* eslint-disable prettier/prettier */
export class ApiResponse {
  constructor(public status: string, public statusCode: number, public message?: string) {
    this.status = status;
    this.statusCode = statusCode;
    this.message =  message;
  }
}

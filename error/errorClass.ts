export class ApiError {
  statusCode: Number;
  message: string;
  error: string;

  constructor(statusCode: Number, message: string, error: string) {
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
  }

  static error(statusCode: Number, message: string, error: string) {
    return new ApiError(statusCode, message, error);
  }
}

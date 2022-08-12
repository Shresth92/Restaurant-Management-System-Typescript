"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError {
    constructor(statusCode, message, error) {
        this.statusCode = statusCode;
        this.message = message;
        this.error = error;
    }
    static error(statusCode, message, error) {
        return new ApiError(statusCode, message, error);
    }
}
exports.ApiError = ApiError;

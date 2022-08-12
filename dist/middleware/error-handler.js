"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError = require("../error/errorClass");
const errorHandler = (error, req, res, next) => {
    console.log(req.file);
    console.log(error);
    return res
        .status(error.statusCode)
        .json({ message: error.message, error: error.error });
};
const pageNotFound = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const err = new Error(`Page Not found`);
    return next(ApiError.error(404, "No page found", err.message));
});
exports.default = { errorHandler, pageNotFound };

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const errorClass_1 = require("../error/errorClass");
const authValidate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield joi_1.default.object({
            email: joi_1.default.string().email().lowercase().required(),
            password: joi_1.default.string().min(5).required(),
        }).validateAsync(req.body);
        next();
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(422, error.message, error));
    }
});
const registerValidate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(1);
        yield joi_1.default.object({
            name: joi_1.default.string().required(),
            email: joi_1.default.string().email().lowercase().required(),
            password: joi_1.default.string().min(5).required(),
        }).validateAsync(req.body);
        console.log(2);
        next();
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, error.message, error));
    }
});
const paginationValidate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield joi_1.default.object({
            limit: joi_1.default.number().required(),
            page: joi_1.default.number().required(),
        }).validateAsync(req.query);
        next();
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, error.message, error));
    }
});
const filterValidate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield joi_1.default.object({
            limit: joi_1.default.number().required(),
            page: joi_1.default.number().required(),
            role: joi_1.default.string(),
        }).validateAsync(req.query);
        next();
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(422, error.message, error));
    }
});
const addressValidate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield joi_1.default.object({
            address: joi_1.default.string().required(),
            lat: joi_1.default.number().required().min(-90).max(90),
            long: joi_1.default.number().required().min(-180).max(180),
        }).validateAsync(req.body);
        next();
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(422, error.message, error));
    }
});
const dishValidate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield joi_1.default.object({
            name: joi_1.default.string().required(),
        }).validateAsync(req.body);
        next();
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(422, error.message, error));
    }
});
const restaurantValidate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield joi_1.default.object({
            name: joi_1.default.string().required(),
            address: joi_1.default.string().required().max(50),
            lat: joi_1.default.number().required().min(-90).max(90),
            long: joi_1.default.number().required().min(-180).max(180),
        }).validateAsync(req.body);
        next();
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(422, error.message, error));
    }
});
exports.default = {
    authValidate,
    registerValidate,
    paginationValidate,
    filterValidate,
    addressValidate,
    dishValidate,
    restaurantValidate,
};

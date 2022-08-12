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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_query_1 = __importDefault(require("../helpers/db-query"));
const errorClass_1 = require("../error/errorClass");
var Role;
(function (Role) {
    Role["user"] = "user";
    Role["admin"] = "admin";
    Role["subadmin"] = "subadmin";
})(Role || (Role = {}));
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null)
        return next(errorClass_1.ApiError.error(401, "Unauthorized", "Token is not sent"));
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err)
            return next(errorClass_1.ApiError.error(403, err.message, err));
        try {
            (() => __awaiter(void 0, void 0, void 0, function* () {
                const count = yield db_query_1.default.searchSessionEnd(payload.session_id);
                if (payload.role == Role["admin"] ||
                    payload.role == Role["subadmin"]) {
                    req.created_by = payload.id;
                }
                if (count) {
                    req.session_id = payload.session_id;
                    req.id = payload.id;
                    req.role = payload.role;
                    next();
                }
                else {
                    return next(errorClass_1.ApiError.error(400, "Please login first", "User already logged out"));
                }
            }))();
        }
        catch (error) {
            return next(errorClass_1.ApiError.error(500, "Something went wrong.", error));
        }
    });
});
const checkuser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.role == Role["user"]) {
        next();
    }
    else {
        return next(errorClass_1.ApiError.error(403, "Forbidden", "Cannot access user routes"));
    }
});
const checkadmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.role == Role["admin"]) {
        next();
    }
    else {
        return next(errorClass_1.ApiError.error(403, "Forbidden", "Cannot access admin routes"));
    }
});
const checksubadmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.role == Role["subadmin"]) {
        next();
    }
    else {
        return next(errorClass_1.ApiError.error(403, "Forbidden", "Cannot access sub admin routes"));
    }
});
const setadmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.setrole = Role.admin;
    next();
});
const setsubadmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.setrole = Role.subadmin;
    next();
});
const setuser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.setrole = Role.user;
    next();
});
exports.default = {
    authenticateToken,
    checkadmin,
    checkuser,
    checksubadmin,
    setadmin,
    setsubadmin,
    setuser,
};

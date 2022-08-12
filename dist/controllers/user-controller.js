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
const db_query_1 = __importDefault(require("../helpers/db-query"));
const errorClass_1 = require("../error/errorClass");
const Address = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address, lat, long } = req.body;
        const user_id = req.id;
        if (yield db_query_1.default.checkAddress(user_id, lat, long)) {
            yield db_query_1.default.addAddress(user_id, address, lat, long);
            return res.status(201).json({ message: "Address added succesfully" });
        }
        else {
            const err = new Error("Address details already exists in table.");
            return next(errorClass_1.ApiError.error(409, "Address already exists.", err.message));
        }
    }
    catch (error) {
        return next(error);
    }
});
exports.default = { Address };

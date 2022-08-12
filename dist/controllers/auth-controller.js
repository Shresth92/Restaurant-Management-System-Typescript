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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_query_1 = __importDefault(require("../helpers/db-query"));
const errorClass_1 = require("../error/errorClass");
var Role;
(function (Role) {
    Role["user"] = "user";
    Role["admin"] = "admin";
    Role["subadmin"] = "subadmin";
})(Role || (Role = {}));
const Register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const users = yield db_query_1.default.users(email);
        const hashpass = yield bcrypt_1.default.hash(password, 10);
        if (users.length == 0) {
            const role = req.setrole;
            yield db_query_1.default.registerUser(name, email, hashpass, role, req.created_by);
            return res.status(201).send("You have registered succesfully.");
        }
        let user_id = users[0].id;
        const roles = yield db_query_1.default.checkRole(user_id, req.setrole);
        if (roles.length == 0) {
            yield db_query_1.default.createRole(user_id, req.setrole, req.created_by);
            return res.status(201).send("You have registered succesfully.");
        }
        else {
            const err = new Error("User details already exists in table.");
            return next(errorClass_1.ApiError.error(409, "Email already exists.", err.message));
        }
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, "Something went wrong", error));
    }
});
const Login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const users = yield db_query_1.default.users(email);
        const user_id = users[0].id;
        const checkRole = yield db_query_1.default.checkRole(user_id, req.setrole);
        if (users.length == 0 || checkRole.length == 0) {
            const err = new Error("User have to register first.");
            return next(errorClass_1.ApiError.error(401, "Please register first.", err.message));
        }
        else {
            if (yield bcrypt_1.default.compare(password, users[0].password)) {
                let session_id = yield db_query_1.default.createSession(user_id);
                const accessToken = jsonwebtoken_1.default.sign({
                    id: user_id,
                    session_id: session_id,
                    role: checkRole[0].role_name,
                }, process.env.ACCESS_TOKEN_SECRET);
                res.json({ accessToken: accessToken });
            }
            else {
                const err = new Error("Password user have entered did not match.");
                return next(errorClass_1.ApiError.error(422, "Enter right password.", err.message));
            }
        }
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, "Something went wrong.", error));
    }
});
const Logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session_id = req.session_id;
        yield db_query_1.default.setSessionEnd(session_id);
        res.send("You are logged out succesfully.");
    }
    catch (error) {
        return next(error);
    }
});
exports.default = {
    Register,
    Login,
    Logout,
};

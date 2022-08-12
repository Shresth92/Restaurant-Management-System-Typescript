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
const app_1 = __importDefault(require("../firebase/app"));
const uuid_1 = require("uuid");
const storage = app_1.default.storage().bucket();
var Role;
(function (Role) {
    Role["user"] = "user";
    Role["admin"] = "admin";
    Role["subadmin"] = "subadmin";
})(Role || (Role = {}));
const all = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, role } = req.body;
        if (req.role == Role["subadmin"]) {
            const role = "user";
        }
        const addressMap = new Map();
        const users = yield db_query_1.default.all(limit, page, role);
        const formatted_users = users.users;
        const user_ids = [];
        for (let i = 0; i < users.count; i++) {
            user_ids.push(formatted_users[i].id);
        }
        const address = yield db_query_1.default.Address(user_ids);
        for (let i = 0; i < address.count; i++) {
            if (addressMap.has(address.search[i].user_id)) {
                addressMap
                    .get(address.search[i].user_id)
                    .push(address.search[i].address);
            }
            else {
                addressMap.set(address.search[i].user_id, [address.search[i].address]);
            }
        }
        for (let i = 0; i < users.count; i++) {
            formatted_users[i].address = addressMap.get(formatted_users[i].id) || [];
        }
        return res.status(200).send(formatted_users);
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, "Something went wrong.", error));
    }
});
const createRestaurant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, address, lat, long } = req.body;
        const checkRestaurant = yield db_query_1.default.checkRestaurant(name, address);
        if (checkRestaurant.length == 0) {
            yield db_query_1.default.createRestaurant(req.id, name, address, lat, long);
            return res.status(201).send("Restaurant has been added");
        }
        else {
            const err = new Error("Restaurant details already exists in table.");
            return next(errorClass_1.ApiError.error(409, "Restaurant already exists.", err.message));
        }
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, "Something went wrong.", error));
    }
});
const createDishes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const { res_id } = req.params;
        const dish = yield db_query_1.default.checkDish(name, res_id);
        if (dish.length == 0) {
            yield db_query_1.default.createDish(res_id, name);
            return res.status(201).send("Dish has been added");
        }
        else {
            const err = new Error("Dish details already exists in table.");
            return next(errorClass_1.ApiError.error(409, "Dish already exists.", err.message));
        }
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, "Something went wrong.", error));
    }
});
const Restaurants = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page } = req.query;
        let id = null;
        if (req.role == Role["subadmin"]) {
            id = req.id;
        }
        const search = yield db_query_1.default.allRestaurants(Number(limit), Number(page), id);
        if (search.length == 0) {
            return res.send("No result");
        }
        const rest = {
            totalRows: search[0].count,
            rows: search,
        };
        return res.status(200).send(rest);
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, "Something went wrong.", error));
    }
});
const Dishes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page } = req.query;
        const { res_id } = req.params;
        let id = null;
        if (req.role == Role["subadmin"]) {
            id = req.id;
        }
        const search = yield db_query_1.default.allDishes(Number(limit), Number(page), res_id, id);
        if (search.length == 0) {
            return res.send("No result");
        }
        const dish = {
            totalRows: search[0].count,
            rows: search,
        };
        return res.status(200).send(dish);
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, "Something went wrong.", error));
    }
});
const RestaurantImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        const name = file === null || file === void 0 ? void 0 : file.filename;
        const fileName = `F:/rms-ts/images/${name}`;
        const metadata = {
            metadata: {
                firebaseStorageDownloadTokens: (0, uuid_1.v4)(),
            },
            contentType: "image/jpeg",
            cacheControl: "public, max-age=31536000",
        };
        yield storage.upload(fileName, {
            gzip: true,
            metadata: metadata,
        });
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, "Something went wrong.", error));
    }
});
exports.default = {
    all,
    createRestaurant,
    createDishes,
    Dishes,
    Restaurants,
    RestaurantImage,
};

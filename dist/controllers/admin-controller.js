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
const storage = app_1.default.storage().bucket();
var Role;
(function (Role) {
    Role["user"] = "user";
    Role["admin"] = "admin";
    Role["subadmin"] = "subadmin";
})(Role || (Role = {}));
const all = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, role } = req.query;
        if (req.role == Role["subadmin"]) {
            const role = Role.user;
        }
        const addressMap = new Map();
        const users = yield db_query_1.default.all(Number(limit), Number(page), role);
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
        return res
            .status(200)
            .send({ totalRows: formatted_users[0].count, rows: formatted_users });
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, "Something went wrong.", error.message));
    }
});
const createRestaurant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, address, lat, long } = req.body;
        const checkRestaurant = yield db_query_1.default.checkRestaurant(name, address);
        if (checkRestaurant == 0) {
            yield db_query_1.default.createRestaurant(req.id, name, address, lat, long);
            return res.status(201).send("Restaurant has been added");
        }
        else {
            const err = new Error("Restaurant details already exists in table.");
            return next(errorClass_1.ApiError.error(409, "Restaurant already exists.", err.message));
        }
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, "Something went wrong.", error.message));
    }
});
const createDishes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const { res_id } = req.params;
        const dishcount = yield db_query_1.default.checkDish(name, res_id);
        if (dishcount == 0) {
            yield db_query_1.default.createDish(res_id, name);
            return res.status(201).send("Dish has been added");
        }
        else {
            const err = new Error("Dish details already exists in table.");
            return next(errorClass_1.ApiError.error(409, "Dish already exists.", err.message));
        }
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, "Something went wrong.", error.message));
    }
});
const Restaurants = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { limit, page } = req.query;
        let id = null;
        if (req.role == Role["subadmin"]) {
            id = req.id;
        }
        const search = yield db_query_1.default.allRestaurants(Number(limit), Number(page), id);
        if (search.rows.length == 0) {
            const rest = {
                totalRows: 0,
                rows: search,
            };
            return res.json({ rest: rest });
        }
        const rest_id = [];
        for (let i = 0; i < search.count; i++) {
            rest_id.push(search.rows[i].id);
        }
        const images = yield db_query_1.default.RestaurantImagePath(rest_id);
        const imageMap = new Map();
        for (let i = 0; i < images.count; i++) {
            const futureDate = new Date(new Date().getTime() + 10 * 60000);
            const link = yield storage.file(images.rows[i].path).getSignedUrl({
                action: "read",
                expires: futureDate,
            });
            if (imageMap.has(images.rows[i].res_id)) {
                (_a = imageMap.get(images.rows[i].res_id)) === null || _a === void 0 ? void 0 : _a.push(link);
            }
            else {
                imageMap.set(images.rows[i].res_id, [link]);
            }
        }
        const formatted_rest = search.rows;
        for (let i = 0; i < search.count; i++) {
            if (imageMap.has(formatted_rest[i].id)) {
                formatted_rest[i].images = imageMap.get(formatted_rest[i].id);
            }
            else {
                formatted_rest[i].images = [];
            }
        }
        const rest = {
            totalRows: search.rows[0].count,
            rows: formatted_rest,
        };
        return res.status(200).json(rest);
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, "Something went wrong.", error.message));
    }
});
const Dishes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { limit, page } = req.query;
        const { res_id } = req.params;
        let id = null;
        if (req.role == Role["subadmin"]) {
            id = req.id;
        }
        const search = yield db_query_1.default.allDishes(Number(limit), Number(page), res_id, id);
        if (search.count == 0) {
            const dish = {
                totalRows: 0,
                rows: search,
            };
            return res.json({ dish: dish });
        }
        const dish_id = [];
        for (let i = 0; i < search.count; i++) {
            dish_id.push(search.rows[i].id);
        }
        const images = yield db_query_1.default.DishImagePath(dish_id);
        const imageMap = new Map();
        for (let i = 0; i < images.count; i++) {
            const futureDate = new Date(new Date().getTime() + 10 * 60000);
            const link = yield storage.file(images.rows[i].path).getSignedUrl({
                action: "read",
                expires: futureDate,
            });
            if (imageMap.has(images.rows[i].dish_id)) {
                (_b = imageMap.get(images.rows[i].dish_id)) === null || _b === void 0 ? void 0 : _b.push(link);
            }
            else {
                imageMap.set(images.rows[i].dish_id, [link]);
            }
        }
        const formatted_dish = search.rows;
        for (let i = 0; i < search.count; i++) {
            if (imageMap.has(formatted_dish[i].id)) {
                formatted_dish[i].images = imageMap.get(formatted_dish[i].id);
            }
            else {
                formatted_dish[i].images = [];
            }
        }
        const dish = {
            totalRows: search.rows[0].count,
            rows: formatted_dish,
        };
        return res.status(200).json(dish);
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, "Something went wrong.", error.message));
    }
});
const RestaurantImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { res_id } = req.params;
        const file = req.file;
        let timestamp = new Date().toISOString();
        const name = file === null || file === void 0 ? void 0 : file.originalname.split(".")[0];
        const type = file === null || file === void 0 ? void 0 : file.originalname.split(".")[1];
        const fileName = `restaurants/${res_id}/` + `${name}_${timestamp}.${type}`;
        storage.file(fileName).createWriteStream().end(file === null || file === void 0 ? void 0 : file.buffer);
        yield db_query_1.default.createRestaurantImage("rms-restaurant-image-upload", fileName, res_id);
        res.send("file uploaded");
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, "Something went wrong.", error.message));
    }
});
const DishImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dish_id } = req.params;
        const file = req.file;
        let timestamp = new Date().toISOString();
        const name = file === null || file === void 0 ? void 0 : file.originalname.split(".")[0];
        const type = file === null || file === void 0 ? void 0 : file.originalname.split(".")[1];
        const fileName = `dishes/${dish_id}/` + `${name}_${timestamp}.${type}`;
        storage.file(fileName).createWriteStream().end(file === null || file === void 0 ? void 0 : file.buffer);
        yield db_query_1.default.createDishImage("rms-restaurant-image-upload", fileName, dish_id);
        res.send("file uploaded");
    }
    catch (error) {
        return next(errorClass_1.ApiError.error(500, "Something went wrong.", error.message));
    }
});
exports.default = {
    all,
    createRestaurant,
    createDishes,
    Dishes,
    Restaurants,
    RestaurantImage,
    DishImage,
};

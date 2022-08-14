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
const pg_1 = require("pg");
const database_json_1 = __importDefault(require("../database.json"));
let pool = new pg_1.Pool(database_json_1.default["dev"]);
var Role;
(function (Role) {
    Role["user"] = "user";
    Role["admin"] = "admin";
    Role["subadmin"] = "subadmin";
})(Role || (Role = {}));
function currDate() {
    let today = new Date().toISOString();
    return today;
}
const users = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const usersText = `SELECT id, password FROM users WHERE email=$1 and archived_at is null;`;
    const userValues = [email];
    const search = yield pool.query(usersText, userValues);
    return search.rows;
});
const registerUser = (name, email, hashpass, role, created_by) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield pool.connect();
    try {
        yield client.query("BEGIN");
        const insertUserText = `INSERT INTO users(name, email, password, updated_at)
                          VALUES ($1, $2, $3, $4)
                          RETURNING id;`;
        const insertUserValues = [name, email, hashpass, currDate()];
        const users = yield client.query(insertUserText, insertUserValues);
        const insertRolesText = `INSERT INTO roles(user_id, role_name, updated_at, created_by)
                          VALUES ($1, $2, $3, $4)`;
        if (created_by == undefined) {
            created_by = users.rows[0].id;
        }
        const insertRolesValues = [users.rows[0].id, role, currDate(), created_by];
        yield client.query(insertRolesText, insertRolesValues);
        yield client.query("COMMIT");
    }
    catch (err) {
        yield client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
});
const createRole = (user_id, role, created_by) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const insertRolesText = `INSERT INTO roles(user_id, role_name, updated_at, created_by)
                          VALUES ($1, $2, $3, $4)`;
        const insertRolesValues = [user_id, role, currDate(), created_by];
        yield pool.query(insertRolesText, insertRolesValues);
    }
    catch (e) {
        throw e;
    }
});
const checkRole = (user_id, role) => __awaiter(void 0, void 0, void 0, function* () {
    const roleText = `SELECT role_name FROM roles WHERE user_id=$1 and role_name=$2 and archived_at is null`;
    const roleValues = [user_id, role];
    const checkrole = yield pool.query(roleText, roleValues);
    return checkrole.rows;
});
const createSession = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionText = `INSERT INTO session (user_id, created_at) VALUES ($1, $2) RETURNING id;`;
        const sessionValues = [user_id, currDate()];
        const session = yield pool.query(sessionText, sessionValues);
        return session.rows[0].id;
    }
    catch (e) {
        throw e;
    }
});
const setSessionEnd = (session_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionText = `UPDATE session SET end_at=$1 WHERE id=$2;`;
        const sessionValues = [currDate(), session_id];
        yield pool.query(sessionText, sessionValues);
    }
    catch (e) {
        throw e;
    }
});
const searchSessionEnd = (session_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionText = `SELECT end_at FROM session WHERE id=$1;`;
        const sessionValues = [session_id];
        const search = yield pool.query(sessionText, sessionValues);
        return search.rows[0].end_at;
    }
    catch (e) {
        throw e;
    }
});
const all = (limit, page, role) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userText = `with all_users as (select u.id, name, email
                                      from users u
                                                join roles r on u.id = r.user_id
                                      where role_name = $1
                                            and r.archived_at is null
                                            and u.archived_at is null)
                    Select *
                    from all_users au
                            join (select count(*) from all_users) as count on true
                    limit $2 offset $3;`;
        const userValues = [role, limit, page * limit];
        const users = yield pool.query(userText, userValues);
        return {
            count: users.rowCount,
            users: users.rows,
        };
    }
    catch (e) {
        throw e;
    }
});
const checkRestaurant = (name, address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurantText = `SELECT id FROM restaurant WHERE name=$1 and address=$2 and archived_at is NULL;`;
        const restaurantValues = [name, address];
        const search = yield pool.query(restaurantText, restaurantValues);
        return search.rowCount;
    }
    catch (e) {
        throw e;
    }
});
const createRestaurant = (user_id, name, address, lat, long) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lat_long = `(${lat}, ${long})`;
        const restaurantText = `INSERT INTO restaurant(user_id, name, address, lat_long, updated_at)
                          VALUES ($1, $2, $3, $4, $5)`;
        const restaurantValues = [user_id, name, address, lat_long, currDate()];
        yield pool.query(restaurantText, restaurantValues);
    }
    catch (e) {
        throw e;
    }
});
const createRestaurantImage = (bucket_name, path, res_id) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield pool.connect();
    try {
        yield client.query("BEGIN");
        const imageText = `INSERT INTO images(bucket_name, path, updated_at)
                          VALUES ($1, $2, $3) RETURNING id`;
        const imageValues = [bucket_name, path, currDate()];
        const imageQuery = yield client.query(imageText, imageValues);
        const id = imageQuery.rows[0].id;
        const restaurantText = `INSERT INTO restaurantimages(image_id, res_id, updated_at)
                          VALUES ($1, $2, $3)`;
        const restaurantValues = [id, res_id, currDate()];
        yield client.query(restaurantText, restaurantValues);
        yield client.query("COMMIT");
    }
    catch (e) {
        yield client.query("ROLLBACK");
        throw e;
    }
    finally {
        client.release();
    }
});
const checkDish = (name, res_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dishText = `SELECT id FROM dishes WHERE name = $1 and rest_id = $2 and archived_at is null;`;
        const dishValues = [name, res_id];
        const dish = yield pool.query(dishText, dishValues);
        return dish.rowCount;
    }
    catch (e) {
        throw e;
    }
});
const createDish = (res_id, name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurantText = `SELECT id FROM restaurant WHERE id=$1 and archived_at is NULL;`;
        const restaurantValues = [res_id];
        const restaurant = yield pool.query(restaurantText, restaurantValues);
        if (restaurant.rowCount) {
            const dishText = `INSERT INTO dishes(rest_id, name, updated_at) VALUES ($1,$2,$3)`;
            const dishValues = [restaurant.rows[0].id, name, currDate()];
            yield pool.query(dishText, dishValues);
        }
        else {
            throw new Error("Restaurant not exist.");
        }
    }
    catch (e) {
        throw e;
    }
});
const createDishImage = (bucket_name, path, dish_id) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield pool.connect();
    try {
        yield client.query("BEGIN");
        const imageText = `INSERT INTO images(bucket_name, path, updated_at)
                          VALUES ($1, $2, $3) RETURNING id`;
        const imageValues = [bucket_name, path, currDate()];
        const imageQuery = yield client.query(imageText, imageValues);
        const id = imageQuery.rows[0].id;
        const dishText = `INSERT INTO dishimages(image_id, dish_id, updated_at)
                          VALUES ($1, $2, $3)`;
        const dishValues = [id, dish_id, currDate()];
        yield client.query(dishText, dishValues);
        yield client.query("COMMIT");
    }
    catch (e) {
        yield client.query("ROLLBACK");
        throw e;
    }
    finally {
        client.release();
    }
});
const allRestaurants = (limit, page, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const restaurantText = `with my_restaurants as (select id, user_id, name, address, lat_long
                                            from restaurant
                                            where archived_at is null
                                            and  (length($1) is null or user_id=$1::uuid))
                    Select *
                    from my_restaurants mr
                    join (select count(*) from my_restaurants) as count on true
                    limit $2 offset $3;`;
        const restaurantValues = [id, limit, limit * page];
        const search = yield pool.query(restaurantText, restaurantValues);
        return {
            count: search.rowCount,
            rows: search.rows,
        };
    }
    catch (e) {
        throw e;
    }
});
const RestaurantImagePath = (rest_id) => __awaiter(void 0, void 0, void 0, function* () {
    const RestaurantImagePathText = `select ri.res_id, path
                    from restaurantimages ri
                            join images i on ri.image_id = i.id
                    where ri.res_id = ANY($1)
                      and ri.archived_at is null
                      and i.archived_at is null`;
    const RestaurantImagePathValues = [rest_id];
    const search = yield pool.query(RestaurantImagePathText, RestaurantImagePathValues);
    return {
        count: search.rowCount,
        rows: search.rows,
    };
});
const allDishes = (limit, page, res_id, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dishText = `with my_dishes as (select d.id , d.name, d.rest_id
                                              from dishes d
                                                      join restaurant r on d.rest_id = r.id
                                              where d.archived_at is null
                                                and r.archived_at is null
                                                and d.rest_id = $1
                                                and (length($2) is null or
                                                    user_id = $2::uuid))
                      Select *
                      from my_dishes mr
                              join (select count(*) from my_dishes) as count on true
                      limit $3 offset $4;`;
        const dishValues = [res_id, id, limit, limit * page];
        const search = yield pool.query(dishText, dishValues);
        return {
            count: search.rowCount,
            rows: search.rows,
        };
    }
    catch (e) {
        throw e;
    }
});
const DishImagePath = (dish_id) => __awaiter(void 0, void 0, void 0, function* () {
    const DishImagePathText = `select di.dish_id, path
                    from dishimages di
                            join images i on di.image_id = i.id
                    where di.dish_id = ANY($1)
                      and di.archived_at is null
                      and i.archived_at is null`;
    const DishImagePathValues = [dish_id];
    const search = yield pool.query(DishImagePathText, DishImagePathValues);
    return {
        count: search.rowCount,
        rows: search.rows,
    };
});
const checkAddress = (user_id, lat, long) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lat_long = `(${lat}, ${long})`;
        const addressText = `SELECT address from address where user_id=$1 and lat_long~=$2 and archived_at=null`;
        const addressValues = [user_id, lat_long];
        const search = yield pool.query(addressText, addressValues);
        return search.rowCount;
    }
    catch (e) {
        throw e;
    }
});
const addAddress = (user_id, address, lat, long) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lat_long = `(${lat}, ${long})`;
        const addressText = `INSERT INTO address (user_id, address, lat_long, updated_at) VALUES ($1, $2, $3, $4);`;
        const addressValues = [user_id, address, lat_long, currDate()];
        yield pool.query(addressText, addressValues);
    }
    catch (e) {
        throw e;
    }
});
const Address = (user_ids) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const addressText = `SELECT user_id, address from address where archived_at is null and user_id = ANY($1)`;
        const addressValues = [user_ids];
        const search = yield pool.query(addressText, addressValues);
        return {
            count: search.rowCount,
            search: search.rows,
        };
    }
    catch (e) {
        throw e;
    }
});
exports.default = {
    users,
    registerUser,
    createRole,
    checkRole,
    createSession,
    setSessionEnd,
    searchSessionEnd,
    all,
    checkRestaurant,
    createRestaurant,
    createRestaurantImage,
    checkDish,
    createDish,
    createDishImage,
    allRestaurants,
    allDishes,
    checkAddress,
    addAddress,
    Address,
    RestaurantImagePath,
    DishImagePath,
};

import { Pool, QueryResult } from "pg";
import pool_conf from "../database.json";
let pool = new Pool(pool_conf["dev"]);

enum Role {
  user = "user",
  admin = "admin",
  subadmin = "subadmin",
}

type Created_by = string | undefined;

function currDate() {
  let today = new Date().toISOString();
  return today as string;
}

const users = async (email: string) => {
  const usersText = `SELECT id, password FROM users WHERE email=$1 and archived_at is null;`;
  const userValues = [email];
  const search = await pool.query(usersText, userValues);
  return search.rows as { id: string; password: string }[];
};

const registerUser = async (
  name: string,
  email: string,
  hashpass: string,
  role: Role,
  created_by: Created_by
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const insertUserText = `INSERT INTO users(name, email, password, updated_at)
                          VALUES ($1, $2, $3, $4)
                          RETURNING id;`;
    const insertUserValues = [name, email, hashpass, currDate()];
    const users = await client.query(insertUserText, insertUserValues);
    const insertRolesText = `INSERT INTO roles(user_id, role_name, updated_at, created_by)
                          VALUES ($1, $2, $3, $4)`;
    if (created_by == undefined) {
      created_by = users.rows[0].id;
    }
    const insertRolesValues = [users.rows[0].id, role, currDate(), created_by];
    await client.query(insertRolesText, insertRolesValues);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const createRole = async (
  user_id: string,
  role: Role,
  created_by: Created_by
) => {
  try {
    const insertRolesText = `INSERT INTO roles(user_id, role_name, updated_at, created_by)
                          VALUES ($1, $2, $3, $4)`;
    const insertRolesValues = [user_id, role, currDate(), created_by];
    await pool.query(insertRolesText, insertRolesValues);
  } catch (e) {
    throw e;
  }
};

const checkRole = async (user_id: string, role: Role) => {
  const roleText = `SELECT role_name FROM roles WHERE user_id=$1 and role_name=$2 and archived_at is null`;
  const roleValues = [user_id, role];
  const checkrole = await pool.query(roleText, roleValues);
  return checkrole.rows as { role_name: Role }[];
};

const createSession = async (user_id: string) => {
  try {
    const sessionText = `INSERT INTO session (user_id, created_at) VALUES ($1, $2) RETURNING id;`;
    const sessionValues = [user_id, currDate()];
    const session = await pool.query(sessionText, sessionValues);
    return session.rows[0].id as string;
  } catch (e) {
    throw e;
  }
};

const setSessionEnd = async (session_id: string | undefined) => {
  try {
    const sessionText = `UPDATE session SET end_at=$1 WHERE id=$2;`;
    const sessionValues = [currDate(), session_id];
    await pool.query(sessionText, sessionValues);
  } catch (e) {
    throw e;
  }
};

const searchSessionEnd = async (session_id: string | undefined) => {
  try {
    const sessionText = `SELECT end_at FROM session WHERE id=$1;`;
    const sessionValues = [session_id];
    const search = await pool.query(sessionText, sessionValues);
    return search.rows[0].end_at;
  } catch (e) {
    throw e;
  }
};

const all = async (limit: number, page: number, role: Role) => {
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
    const users = await pool.query(userText, userValues);
    return {
      count: users.rowCount as number,
      users: users.rows as {
        address?: string[];
        id: string;
        name: string;
        email: string;
        count: number;
      }[],
    };
  } catch (e) {
    throw e;
  }
};

const checkRestaurant = async (name: string, address: string) => {
  try {
    const restaurantText = `SELECT id FROM restaurant WHERE name=$1 and address=$2 and archived_at is NULL;`;
    const restaurantValues = [name, address];
    const search = await pool.query(restaurantText, restaurantValues);
    return search.rowCount as number;
  } catch (e) {
    throw e;
  }
};

const createRestaurant = async (
  user_id: string | undefined,
  name: string,
  address: string,
  lat: number,
  long: number
) => {
  try {
    const lat_long = `(${lat}, ${long})`;
    const restaurantText = `INSERT INTO restaurant(user_id, name, address, lat_long, updated_at)
                          VALUES ($1, $2, $3, $4, $5)`;
    const restaurantValues = [user_id, name, address, lat_long, currDate()];
    await pool.query(restaurantText, restaurantValues);
  } catch (e) {
    throw e;
  }
};

const createRestaurantImage = async (
  bucket_name: string,
  path: string,
  res_id: string
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const imageText = `INSERT INTO images(bucket_name, path, updated_at)
                          VALUES ($1, $2, $3) RETURNING id`;
    const imageValues = [bucket_name, path, currDate()];
    const imageQuery = await client.query(imageText, imageValues);
    const id: string = imageQuery.rows[0].id as string;
    const restaurantText = `INSERT INTO restaurantimages(image_id, res_id, updated_at)
                          VALUES ($1, $2, $3)`;
    const restaurantValues = [id, res_id, currDate()];
    await client.query(restaurantText, restaurantValues);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

const checkDish = async (name: string, res_id: string) => {
  try {
    const dishText = `SELECT id FROM dishes WHERE name = $1 and rest_id = $2 and archived_at is null;`;
    const dishValues = [name, res_id];
    const dish = await pool.query(dishText, dishValues);
    return dish.rowCount as number;
  } catch (e) {
    throw e;
  }
};

const createDish = async (res_id: string, name: string) => {
  try {
    const restaurantText = `SELECT id FROM restaurant WHERE id=$1 and archived_at is NULL;`;
    const restaurantValues = [res_id];
    const restaurant = await pool.query(restaurantText, restaurantValues);
    if (restaurant.rowCount) {
      const dishText = `INSERT INTO dishes(rest_id, name, updated_at) VALUES ($1,$2,$3)`;
      const dishValues = [restaurant.rows[0].id, name, currDate()];
      await pool.query(dishText, dishValues);
    } else {
      throw new Error("Restaurant not exist.");
    }
  } catch (e) {
    throw e;
  }
};

const createDishImage = async (
  bucket_name: string,
  path: string,
  dish_id: string
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const imageText = `INSERT INTO images(bucket_name, path, updated_at)
                          VALUES ($1, $2, $3) RETURNING id`;
    const imageValues = [bucket_name, path, currDate()];
    const imageQuery = await client.query(imageText, imageValues);
    const id: string = imageQuery.rows[0].id as string;
    const dishText = `INSERT INTO dishimages(image_id, dish_id, updated_at)
                          VALUES ($1, $2, $3)`;
    const dishValues = [id, dish_id, currDate()];
    await client.query(dishText, dishValues);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

const allRestaurants = async (
  limit: number,
  page: number,
  id: string | null
) => {
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
    const search = await pool.query(restaurantText, restaurantValues);
    return {
      count: search.rowCount as number,
      rows: search.rows as {
        id: string;
        user_id: string;
        name: string;
        address: string;
        lat_long: string;
        count: number;
        images?: string[];
      }[],
    };
  } catch (e) {
    throw e;
  }
};

const RestaurantImagePath = async (rest_id: string[]) => {
  const RestaurantImagePathText = `select ri.res_id, path
                    from restaurantimages ri
                            join images i on ri.image_id = i.id
                    where ri.res_id = ANY($1)
                      and ri.archived_at is null
                      and i.archived_at is null`;
  const RestaurantImagePathValues = [rest_id];
  const search = await pool.query(
    RestaurantImagePathText,
    RestaurantImagePathValues
  );
  return {
    count: search.rowCount as number,
    rows: search.rows as { res_id: string; path: string }[],
  };
};

const allDishes = async (
  limit: number,
  page: number,
  res_id: string,
  id: string | null
) => {
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
    const search = await pool.query(dishText, dishValues);
    return {
      count: search.rowCount as number,
      rows: search.rows as {
        id: string;
        name: string;
        rest_id: string;
        count: number;
        images?: string[];
      }[],
    };
  } catch (e) {
    throw e;
  }
};

const DishImagePath = async (dish_id: string[]) => {
  const DishImagePathText = `select di.dish_id, path
                    from dishimages di
                            join images i on di.image_id = i.id
                    where di.dish_id = ANY($1)
                      and di.archived_at is null
                      and i.archived_at is null`;
  const DishImagePathValues = [dish_id];
  const search = await pool.query(DishImagePathText, DishImagePathValues);
  return {
    count: search.rowCount as number,
    rows: search.rows as { dish_id: string; path: string }[],
  };
};

const checkAddress = async (user_id: string, lat: number, long: number) => {
  try {
    const lat_long = `(${lat}, ${long})`;
    const addressText = `SELECT address from address where user_id=$1 and lat_long~=$2 and archived_at=null`;
    const addressValues = [user_id, lat_long];
    const search = await pool.query(addressText, addressValues);
    return search.rowCount as number;
  } catch (e) {
    throw e;
  }
};

const addAddress = async (
  user_id: string,
  address: string,
  lat: number,
  long: number
) => {
  try {
    const lat_long = `(${lat}, ${long})`;
    const addressText = `INSERT INTO address (user_id, address, lat_long, updated_at) VALUES ($1, $2, $3, $4);`;
    const addressValues = [user_id, address, lat_long, currDate()];
    await pool.query(addressText, addressValues);
  } catch (e) {
    throw e;
  }
};

const Address = async (user_ids: string[]) => {
  try {
    const addressText = `SELECT user_id, address from address where archived_at is null and user_id = ANY($1)`;
    const addressValues = [user_ids];
    const search = await pool.query(addressText, addressValues);
    return {
      count: search.rowCount,
      search: search.rows as { user_id: string; address: string }[],
    };
  } catch (e) {
    throw e;
  }
};

export default {
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

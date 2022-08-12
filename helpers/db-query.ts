import { Pool } from "pg";
import pool_conf from "../database.json";
let pool = new Pool(pool_conf["dev"]);

enum Role {
  user = "user",
  admin = "admin",
  subadmin = "subadmin",
}

type Created_by = string | undefined;

function currDate(): string {
  let today = new Date().toISOString();
  return today;
}

const users = async (email: string) => {
  const usersText = `SELECT id, password FROM users WHERE email=$1 and archived_at is null;`;
  const userValues = [email];
  const search = await pool.query(usersText, userValues);
  return search.rows;
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
  return checkrole.rows;
};

const createSession = async (user_id: string) => {
  try {
    const sessionText = `INSERT INTO session (user_id, created_at) VALUES ($1, $2) RETURNING id;`;
    const sessionValues = [user_id, currDate()];
    const session = await pool.query(sessionText, sessionValues);
    return session.rows[0].id;
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
    return search.rowCount;
  } catch (e) {
    throw e;
  }
};

const all = async (limit: number, page: number, role: Role) => {
  try {
    const userText = `with all_users as (select id, name, email
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
    return { count: users.rowCount as number, users: users.rows as [] };
  } catch (e) {
    throw e;
  }
};

const checkRestaurant = async (name: string, address: string) => {
  try {
    const restaurantText = `SELECT id FROM restaurant WHERE name=$1 and address=$2 and archived_at is NULL;`;
    const restaurantValues = [name, address];
    const search = await pool.query(restaurantText, restaurantValues);
    return search.rows;
  } catch (e) {
    throw e;
  }
};

const createRestaurant = async (
  id: string,
  name: string,
  address: string,
  lat: number,
  long: number
) => {
  try {
    const lat_long = `(${lat}, ${long})`;
    const restaurantText = `INSERT INTO restaurant(user_id, name, address, lat_long, updated_at)
                          VALUES ($1, $2, $3, $4, $5)`;
    const restaurantValues = [id, name, address, lat_long, currDate()];
    await pool.query(restaurantText, restaurantValues);
  } catch (e) {
    throw e;
  }
};

const checkDish = async (name: string, res_id: string) => {
  try {
    const dishText = `SELECT archived_at FROM dishes WHERE name = $1 and restaurant_id = $2;`;
    const dishValues = [name, res_id];
    const dish = await pool.query(dishText, dishValues);
    return dish.rows;
  } catch (e) {
    throw e;
  }
};

const createDish = async (res_id: string, name: string) => {
  try {
    const restaurantText = `SELECT id FROM restaurant WHERE id=$1 and archived_at is NULL;`;
    const restaurantValues = [res_id];
    const restaurant = await pool.query(restaurantText, restaurantValues);
    const dishText = `INSERT INTO dishes(res_id, name, updated_at) VALUES ($1,$2,$3)`;
    const dishValues = [restaurant.rows[0].id, name, currDate()];
    await pool.query(dishText, dishValues);
  } catch (e) {
    throw e;
  }
};

const allRestaurants = async (limit: number, page: number, id: string) => {
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
    return search.rows;
  } catch (e) {
    throw e;
  }
};

const allDishes = async (
  limit: number,
  page: number,
  res_id: string,
  id: string
) => {
  try {
    const dishText = `with my_dishes as (select d.name
                                              from dishes d
                                                      join restaurant r on d.restaurant_id = r.id
                                              where d.archived_at is null
                                                and r.archived_at is null
                                                and id = $1
                                                and (length($2) is null or
                                                    user_id = $2::uuid))
                      Select *
                      from my_dishes mr
                              join (select count(*) from my_dishes) as count on true
                      limit $3 offset $4;`;
    const dishValues = [res_id, id, limit, limit * page];
    const search = await pool.query(dishText, dishValues);
    return search.rows;
  } catch (e) {
    throw e;
  }
};

const checkAddress = async (user_id: string, lat: number, long: number) => {
  try {
    const lat_long = `(${lat}, ${long})`;
    const addressText = `SELECT address from address where user_id=$1 and lat_long~=$2 and archived_at=null`;
    const addressValues = [user_id, lat_long];
    const search = await pool.query(addressText, addressValues);
    return search.rows.length;
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

const allAddress = async (id: string, limit: number, page: number) => {
  try {
    const addressText = `with my_address as (select user_id, address
                                      from address a
                                      where (length($3) is null or
                                                    user_id = $3::uuid)
                                        and archived_at is null)
                  Select *
                  from my_address mr
                          join (select count(*) from my_address) as count on true
                  limit $1 offset $2;`;
    const addressValues = [limit, limit * page, id];
    const search = await pool.query(addressText, addressValues);
    return search.rows;
  } catch (e) {
    throw e;
  }
};

const Address = async (user_ids: string[]) => {
  try {
    const addressText = `SELECT user_id, address from address where archived_at is null and user_id = ANY($1)`;
    const addressValues = [user_ids];
    const search = await pool.query(addressText, addressValues);
    return { count: search.rowCount, search: search.rows };
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
  checkDish,
  createDish,
  allRestaurants,
  allDishes,
  allAddress,
  checkAddress,
  addAddress,
  Address,
};

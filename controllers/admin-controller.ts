import { Request, Response, NextFunction } from "express";
import query from "../helpers/db-query";
import { ApiError } from "../error/errorClass";

enum Role {
  user = "user",
  admin = "admin",
  subadmin = "subadmin",
}

const all = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, page, role } = req.body;
    if (req.role == Role["subadmin"]) {
      const role = "user";
    }
    const addressMap = new Map();
    const users = await query.all(limit, page, role);
    const formatted_users: { id: string; address: string }[] = users.users;
    const user_ids: string[] = [];
    for (let i = 0; i < users.count; i++) {
      user_ids.push(formatted_users[i].id);
    }
    const address = await query.Address(user_ids);
    for (let i = 0; i < address.count; i++) {
      if (addressMap.has(address.search[i].user_id)) {
        addressMap
          .get(address.search[i].user_id)
          .push(address.search[i].address);
      } else {
        addressMap.set(address.search[i].user_id, [address.search[i].address]);
      }
    }
    for (let i = 0; i < users.count; i++) {
      formatted_users[i].address = addressMap.get(formatted_users[i].id) || [];
    }
    return res.status(200).send(formatted_users);
  } catch (error: any) {
    return next(ApiError.error(500, "Something went wrong.", error));
  }
};

const createRestaurant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, address, lat, long } = req.body;
    const checkRestaurant = await query.checkRestaurant(name, address);
    if (checkRestaurant.length == 0) {
      await query.createRestaurant(req.id!, name, address, lat, long);
      return res.status(201).send("Restaurant has been added");
    } else {
      const err = new Error("Restaurant details already exists in table.");
      return next(
        ApiError.error(409, "Restaurant already exists.", err.message)
      );
    }
  } catch (error: any) {
    return next(ApiError.error(500, "Something went wrong.", error));
  }
};

const createDishes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    const { res_id } = req.params;
    const dish = await query.checkDish(name, res_id);
    if (dish.length == 0) {
      await query.createDish(res_id, name);
      return res.status(201).send("Dish has been added");
    } else {
      const err = new Error("Dish details already exists in table.");
      return next(ApiError.error(409, "Dish already exists.", err.message));
    }
  } catch (error: any) {
    return next(ApiError.error(500, "Something went wrong.", error));
  }
};

const Restaurants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, page } = req.query;
    let id = null;
    if (req.role == Role["subadmin"]) {
      id = req.id;
    }
    const search = await query.allRestaurants(Number(limit), Number(page), id!);
    if (search.length == 0) {
      return res.send("No result");
    }
    const rest = {
      totalRows: search[0].count,
      rows: search,
    };
    return res.status(200).send(rest);
  } catch (error: any) {
    return next(ApiError.error(500, "Something went wrong.", error));
  }
};

const Dishes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, page } = req.query;
    const { res_id } = req.params;
    let id = null;
    if (req.role! == Role["subadmin"]) {
      id = req.id;
    }
    const search = await query.allDishes(
      Number(limit),
      Number(page),
      res_id,
      id!
    );
    if (search.length == 0) {
      return res.send("No result");
    }
    const dish = {
      totalRows: search[0].count,
      rows: search,
    };
    return res.status(200).send(dish);
  } catch (error: any) {
    return next(ApiError.error(500, "Something went wrong.", error));
  }
};

export default {
  all,
  createRestaurant,
  createDishes,
  Dishes,
  Restaurants,
};

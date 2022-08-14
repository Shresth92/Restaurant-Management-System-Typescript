import { Request, Response, NextFunction } from "express";
import query from "../helpers/db-query";
import { ApiError } from "../error/errorClass";
import firebase from "../firebase/app";

const storage = firebase.storage().bucket();

enum Role {
  user = "user",
  admin = "admin",
  subadmin = "subadmin",
}

const all = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, page, role } = req.query;
    if (req.role == Role["subadmin"]) {
      const role: Role = Role.user as Role;
    }
    const addressMap = new Map();
    const users = await query.all(
      Number(limit) as number,
      Number(page) as number,
      role as Role
    );
    const formatted_users = users.users;
    const user_ids: string[] = [];
    for (let i = 0; i < users.count; i++) {
      user_ids.push(formatted_users[i].id as string);
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
    return res
      .status(200)
      .send({ totalRows: formatted_users[0].count, rows: formatted_users });
  } catch (error: any) {
    return next(ApiError.error(500, "Something went wrong.", error.message));
  }
};

const createRestaurant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, address, lat, long } = req.body;
    const checkRestaurant = await query.checkRestaurant(
      name as string,
      address as string
    );
    if (checkRestaurant == 0) {
      await query.createRestaurant(
        req.id as string,
        name as string,
        address as string,
        lat as number,
        long as number
      );
      return res.status(201).send("Restaurant has been added");
    } else {
      const err = new Error("Restaurant details already exists in table.");
      return next(
        ApiError.error(409, "Restaurant already exists.", err.message)
      );
    }
  } catch (error: any) {
    return next(ApiError.error(500, "Something went wrong.", error.message));
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
    const dishcount = await query.checkDish(name as string, res_id as string);
    if (dishcount == 0) {
      await query.createDish(res_id as string, name as string);
      return res.status(201).send("Dish has been added");
    } else {
      const err = new Error("Dish details already exists in table.");
      return next(ApiError.error(409, "Dish already exists.", err.message));
    }
  } catch (error: any) {
    return next(ApiError.error(500, "Something went wrong.", error.message));
  }
};

const Restaurants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, page } = req.query;
    let id: string | null = null as string | null;
    if (req.role == Role["subadmin"]) {
      id = req.id as string;
    }
    const search = await query.allRestaurants(
      Number(limit) as number,
      Number(page) as number,
      id
    );
    if (search.rows.length == (0 as number)) {
      const rest = {
        totalRows: 0 as number,
        rows: search,
      };
      return res.json({ rest: rest });
    }
    const rest_id: string[] = [] as string[];
    for (let i = 0; i < search.count; i++) {
      rest_id.push(search.rows[i].id);
    }
    const images = await query.RestaurantImagePath(rest_id);
    const imageMap = new Map();
    for (let i = 0; i < images.count; i++) {
      const futureDate = new Date(new Date().getTime() + 10 * 60000);
      const link = await storage.file(images.rows[i].path).getSignedUrl({
        action: "read",
        expires: futureDate,
      });
      if (imageMap.has(images.rows[i].res_id)) {
        imageMap.get(images.rows[i].res_id)?.push(link);
      } else {
        imageMap.set(images.rows[i].res_id, [link]);
      }
    }
    const formatted_rest = search.rows;
    for (let i = 0; i < search.count; i++) {
      if (imageMap.has(formatted_rest[i].id)) {
        formatted_rest[i].images = imageMap.get(formatted_rest[i].id);
      } else {
        formatted_rest[i].images = [];
      }
    }
    const rest = {
      totalRows: search.rows[0].count as number,
      rows: formatted_rest,
    };
    return res.status(200).json(rest);
  } catch (error: any) {
    return next(ApiError.error(500, "Something went wrong.", error.message));
  }
};

const Dishes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, page } = req.query;
    const { res_id } = req.params;
    let id: string | null = null as string | null;
    if (req.role! == Role["subadmin"]) {
      id = req.id as string;
    }
    const search = await query.allDishes(
      Number(limit) as number,
      Number(page) as number,
      res_id as string,
      id
    );
    if (search.count == 0) {
      const dish = {
        totalRows: 0 as number,
        rows: search,
      };
      return res.json({ dish: dish });
    }
    const dish_id = [] as string[];
    for (let i = 0; i < search.count; i++) {
      dish_id.push(search.rows[i].id);
    }
    const images = await query.DishImagePath(dish_id);
    const imageMap = new Map();
    for (let i = 0; i < images.count; i++) {
      const futureDate = new Date(new Date().getTime() + 10 * 60000);
      const link = await storage.file(images.rows[i].path).getSignedUrl({
        action: "read",
        expires: futureDate,
      });
      if (imageMap.has(images.rows[i].dish_id)) {
        imageMap.get(images.rows[i].dish_id)?.push(link);
      } else {
        imageMap.set(images.rows[i].dish_id, [link]);
      }
    }
    const formatted_dish = search.rows;
    for (let i = 0; i < search.count; i++) {
      if (imageMap.has(formatted_dish[i].id)) {
        formatted_dish[i].images = imageMap.get(formatted_dish[i].id);
      } else {
        formatted_dish[i].images = [];
      }
    }
    const dish = {
      totalRows: search.rows[0].count,
      rows: formatted_dish,
    };
    return res.status(200).json(dish);
  } catch (error: any) {
    return next(ApiError.error(500, "Something went wrong.", error.message));
  }
};

const RestaurantImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { res_id } = req.params;
    const file = req.file;
    let timestamp = new Date().toISOString();
    const name = file?.originalname.split(".")[0];
    const type = file?.originalname.split(".")[1];
    const fileName = `restaurants/${res_id}/` + `${name}_${timestamp}.${type}`;
    storage.file(fileName).createWriteStream().end(file?.buffer);
    await query.createRestaurantImage(
      "rms-restaurant-image-upload",
      fileName,
      res_id
    );
    res.send("file uploaded");
  } catch (error: any) {
    return next(ApiError.error(500, "Something went wrong.", error.message));
  }
};

const DishImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dish_id } = req.params;
    const file = req.file;
    let timestamp = new Date().toISOString();
    const name = file?.originalname.split(".")[0];
    const type = file?.originalname.split(".")[1];
    const fileName = `dishes/${dish_id}/` + `${name}_${timestamp}.${type}`;
    storage.file(fileName).createWriteStream().end(file?.buffer);
    await query.createDishImage(
      "rms-restaurant-image-upload",
      fileName,
      dish_id
    );
    res.send("file uploaded");
  } catch (error: any) {
    return next(ApiError.error(500, "Something went wrong.", error.message));
  }
};

export default {
  all,
  createRestaurant,
  createDishes,
  Dishes,
  Restaurants,
  RestaurantImage,
  DishImage,
};

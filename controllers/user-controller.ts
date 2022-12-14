import { Request, Response, NextFunction } from "express";
import query from "../helpers/db-query";
import { ApiError } from "../error/errorClass";

const Address = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address, lat, long } = req.body;
    const user_id: string = req.id!;
    if (
      await query.checkAddress(user_id as string, lat as number, long as number)
    ) {
      await query.addAddress(
        user_id as string,
        address as string,
        lat as number,
        long as number
      );
      return res
        .status(201)
        .json({ message: "Address added succesfully" as string });
    } else {
      const err = new Error("Address details already exists in table.");
      return next(ApiError.error(409, "Address already exists.", err.message));
    }
  } catch (error) {
    return next(error);
  }
};

export default { Address };

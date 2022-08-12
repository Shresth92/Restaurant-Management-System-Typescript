const ApiError = require("../error/errorClass");
import { Request, Response, NextFunction } from "express";

const errorHandler = (
  error: { statusCode: number; message: string; error: string },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.file);
  console.log(error);
  return res
    .status(error.statusCode as number)
    .json({ message: error.message, error: error.error });
};

const pageNotFound = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const err = new Error(`Page Not found`);
  return next(ApiError.error(404, "No page found", err.message));
};

export default { errorHandler, pageNotFound };

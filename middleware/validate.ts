import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../error/errorClass";

const authValidate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await Joi.object({
      email: Joi.string().email().lowercase().required(),
      password: Joi.string().min(5).required(),
    }).validateAsync(req.body);
    next();
  } catch (error: any) {
    return next(ApiError.error(422, error.message, error));
  }
};

const registerValidate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().lowercase().required(),
      password: Joi.string().min(5).required(),
    }).validateAsync(req.body);
    next();
  } catch (error: any) {
    return next(ApiError.error(500, error.message, error));
  }
};

const paginationValidate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await Joi.object({
      limit: Joi.number().required(),
      page: Joi.number().required(),
    }).validateAsync(req.query);
    next();
  } catch (error: any) {
    return next(ApiError.error(500, error.message, error));
  }
};

const filterValidate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await Joi.object({
      limit: Joi.number().required(),
      page: Joi.number().required(),
      role: Joi.string(),
    }).validateAsync(req.query);
    next();
  } catch (error: any) {
    return next(ApiError.error(422, error.message, error));
  }
};

const addressValidate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await Joi.object({
      address: Joi.string().required(),
      lat: Joi.number().required().min(-90).max(90),
      long: Joi.number().required().min(-180).max(180),
    }).validateAsync(req.body);
    next();
  } catch (error: any) {
    return next(ApiError.error(422, error.message, error));
  }
};

const dishValidate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await Joi.object({
      name: Joi.string().required(),
    }).validateAsync(req.body);
    next();
  } catch (error: any) {
    return next(ApiError.error(422, error.message, error));
  }
};

const restaurantValidate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await Joi.object({
      name: Joi.string().required(),
      address: Joi.string().required().max(50),
      lat: Joi.number().required().min(-90).max(90),
      long: Joi.number().required().min(-180).max(180),
    }).validateAsync(req.body);
    next();
  } catch (error: any) {
    return next(ApiError.error(422, error.message, error));
  }
};

export default {
  authValidate,
  registerValidate,
  paginationValidate,
  filterValidate,
  addressValidate,
  dishValidate,
  restaurantValidate,
};

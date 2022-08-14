import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import query from "../helpers/db-query";
import { ApiError } from "../error/errorClass";

enum Role {
  user = "user",
  admin = "admin",
  subadmin = "subadmin",
}

const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return next(ApiError.error(401, "Unauthorized", "Token is not sent"));
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err: any, payload) => {
      if (err) return next(ApiError.error(403, err.message, err));
      try {
        (async () => {
          const end_at = await query.searchSessionEnd(
            (<any>payload).session_id
          );
          if (
            (<any>payload).role == Role["admin"] ||
            (<any>payload).role == Role["subadmin"]
          ) {
            req.created_by = (<any>payload).id as string;
          }
          if (end_at == null) {
            req.session_id = (<any>payload).session_id as string;
            req.id = (<any>payload).id as string;
            req.role = (<any>payload).role as Role;
            next();
          } else {
            return next(
              ApiError.error(
                400,
                "Please login first",
                "User already logged out"
              )
            );
          }
        })();
      } catch (error: any) {
        return next(ApiError.error(500, "Something went wrong.", error));
      }
    }
  );
};

const checkuser = async (req: Request, res: Response, next: NextFunction) => {
  if ((req.role as Role) == Role["user"]) {
    next();
  } else {
    return next(ApiError.error(403, "Forbidden", "Cannot access user routes"));
  }
};

const checkadmin = async (req: Request, res: Response, next: NextFunction) => {
  if (req.role == Role["admin"]) {
    next();
  } else {
    return next(ApiError.error(403, "Forbidden", "Cannot access admin routes"));
  }
};

const checksubadmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.role == Role["subadmin"]) {
    next();
  } else {
    return next(
      ApiError.error(403, "Forbidden", "Cannot access sub admin routes")
    );
  }
};

const setadmin = async (req: Request, res: Response, next: NextFunction) => {
  req.setrole = Role.admin as Role;
  next();
};

const setsubadmin = async (req: Request, res: Response, next: NextFunction) => {
  req.setrole = Role.subadmin as Role;
  next();
};

const setuser = async (req: Request, res: Response, next: NextFunction) => {
  req.setrole = Role.user as Role;
  next();
};

export default {
  authenticateToken,
  checkadmin,
  checkuser,
  checksubadmin,
  setadmin,
  setsubadmin,
  setuser,
};

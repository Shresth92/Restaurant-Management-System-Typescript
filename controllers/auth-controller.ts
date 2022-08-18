import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import query from "../helpers/db-query";
import { ApiError } from "../error/errorClass";

const Register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const users = await query.users(email as string);
    const hashpass: string = await bcrypt.hash(
      password as string,
      10 as number
    );
    if (users.length == 0) {
      const role = req.setrole as Role;
      await query.registerUser(
        name as string,
        email as string,
        hashpass as string,
        role as Role,
        req.created_by as string
      );
      return res.status(201).send("You have registered succesfully.");
    }
    let user_id = users[0].id as string;
    const roles = await query.checkRole(user_id as string, req.setrole as Role);
    if (roles.length == 0) {
      await query.createRole(
        user_id as string,
        req.setrole! as Role,
        req.created_by as string
      );
      return res.status(201).send("You have registered succesfully.");
    } else {
      const err = new Error("User details already exists in table.");
      return next(ApiError.error(409, "Email already exists.", err.message));
    }
  } catch (error: any) {
    return next(ApiError.error(500, "Something went wrong", error));
  }
};

const Login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const users = await query.users(email as string);
    const user_id = users[0].id as string;
    const checkRole = await query.checkRole(
      user_id as string,
      req.setrole! as Role
    );
    if (users.length == 0 || checkRole.length == 0) {
      const err = new Error("User have to register first.");
      return next(ApiError.error(401, "Please register first.", err.message));
    } else {
      if (
        await bcrypt.compare(password as string, users[0].password as string)
      ) {
        let session_id: string = await query.createSession(user_id);
        const accessToken: string = jwt.sign(
          {
            id: user_id as string,
            session_id: session_id as string,
            role: checkRole[0].role_name as Role,
          },
          process.env.ACCESS_TOKEN_SECRET as string
        );
        res.json({ accessToken: accessToken });
      } else {
        const err = new Error("Password user have entered did not match.");
        return next(ApiError.error(422, "Enter right password.", err.message));
      }
    }
  } catch (error) {
    return next(ApiError.error(500, "Something went wrong.", error as string));
  }
};

const Logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session_id: string = req.session_id as string;
    await query.setSessionEnd(session_id as string);
    res.send("You are logged out succesfully.");
  } catch (error) {
    return next(error);
  }
};

export default {
  Register,
  Login,
  Logout,
};

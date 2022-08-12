import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import query from "../helpers/db-query";
import { ApiError } from "../error/errorClass";

enum Role {
  user = "user",
  admin = "admin",
  subadmin = "subadmin",
}

const Register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const users = await query.users(email);
    const hashpass = await bcrypt.hash(password, 10);
    if (users.length == 0) {
      const role = req.setrole as Role;
      await query.registerUser(name, email, hashpass, role, req.created_by);
      return res.status(201).send("You have registered succesfully.");
    }
    let user_id = users[0].id;
    const roles = await query.checkRole(user_id, req.setrole as Role);
    if (roles.length == 0) {
      await query.createRole(user_id, req.setrole!, req.created_by);
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
    const users = await query.users(email);
    const user_id = users[0].id;
    const checkRole = await query.checkRole(user_id, req.setrole!);
    if (users.length == 0 || checkRole.length == 0) {
      const err = new Error("User have to register first.");
      return next(ApiError.error(401, "Please register first.", err.message));
    } else {
      if (await bcrypt.compare(password, users[0].password)) {
        let session_id = await query.createSession(user_id);
        const accessToken = jwt.sign(
          {
            id: user_id,
            session_id: session_id,
            role: checkRole[0].role_name,
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
    const session_id = req.session_id;
    await query.setSessionEnd(session_id);
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

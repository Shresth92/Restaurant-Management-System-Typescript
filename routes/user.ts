import express from "express";

const router = express.Router();

import rmsController from "../controllers/user-controller";
import middleware from "../middleware/middleware";
import authController from "../controllers/auth-controller";
import adminController from "../controllers/admin-controller";
import validate from "../middleware/validate";

router.post(
  "/register",
  validate.registerValidate,
  middleware.setuser,
  authController.Register
);
router.post(
  "/login",
  validate.authValidate,
  middleware.setuser,
  authController.Login
);
router.get(
  "/restaurants",
  validate.paginationValidate,
  adminController.Restaurants
);
router.get(
  "/:res_id/dishes",
  validate.paginationValidate,
  adminController.Dishes
);
router.use("/", middleware.authenticateToken);
router.use("/", middleware.checkuser);
router.post("/add-address", validate.addressValidate, rmsController.Address);
router.post("/logout", authController.Logout);

export default router;

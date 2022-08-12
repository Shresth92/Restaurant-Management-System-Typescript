import express from "express";

const router = express.Router();

import authController from "../controllers/auth-controller";
import cmsController from "../controllers/admin-controller";
import middleware from "../middleware/middleware";
import validate from "../middleware/validate";

router.post(
  "/login",
  validate.authValidate,
  middleware.setsubadmin,
  authController.Login
);
router.use("/", middleware.authenticateToken);
router.use("/", middleware.checksubadmin);
router.get(
  "/restaurants",
  validate.paginationValidate,
  cmsController.Restaurants
);
router.get(
  "/:res_id/dishes",
  validate.paginationValidate,
  cmsController.Dishes
);
router.post(
  "/add-restaurants",
  validate.restaurantValidate,
  cmsController.createRestaurant
);
router.post(
  "/:res_id/add-dishes",
  validate.dishValidate,
  cmsController.createDishes
);
router.post(
  "/add-user",
  validate.registerValidate,
  middleware.setuser,
  authController.Register
);
router.get("/all", validate.filterValidate, cmsController.all);
router.post("/logout", authController.Logout);

export default router;

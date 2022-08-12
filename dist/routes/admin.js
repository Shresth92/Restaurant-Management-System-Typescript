"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./images");
    },
    filename: function (req, file, callback) {
        var extension = file.originalname.split(".")[1];
        if (extension === "jpg" || extension === "jpeg" || extension === "png") {
            callback(null, file.originalname);
        }
    },
});
const upload = (0, multer_1.default)({ storage: storage }).single("image");
const auth_controller_1 = __importDefault(require("../controllers/auth-controller"));
const admin_controller_1 = __importDefault(require("../controllers/admin-controller"));
const middleware_1 = __importDefault(require("../middleware/middleware"));
const validate_1 = __importDefault(require("../middleware/validate"));
router.post("/login", validate_1.default.authValidate, middleware_1.default.setadmin, auth_controller_1.default.Login);
router.use("/", middleware_1.default.authenticateToken);
router.use("/", middleware_1.default.checkadmin);
router.get("/all", validate_1.default.filterValidate, admin_controller_1.default.all);
router.get("/restaurants", validate_1.default.paginationValidate, admin_controller_1.default.Restaurants);
router.get("/:res_id/dishes", validate_1.default.paginationValidate, admin_controller_1.default.Dishes);
router.post("/add-restaurants", validate_1.default.restaurantValidate, admin_controller_1.default.createRestaurant);
router.post("/add-dishes", validate_1.default.dishValidate, admin_controller_1.default.createDishes);
router.post("/add-subadmin", validate_1.default.registerValidate, middleware_1.default.setsubadmin, auth_controller_1.default.Register);
router.post("/add-user", validate_1.default.registerValidate, middleware_1.default.setuser, auth_controller_1.default.Register);
router.post("/add-restaurant-images", upload, admin_controller_1.default.RestaurantImage);
router.post("/logout", auth_controller_1.default.Logout);
exports.default = router;

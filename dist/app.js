"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
const admin_1 = __importDefault(require("./routes/admin"));
const sub_admin_1 = __importDefault(require("./routes/sub-admin"));
const error_handler_1 = __importDefault(require("./middleware/error-handler"));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/admin", admin_1.default);
app.use("/sub-admin", sub_admin_1.default);
app.use("/user", user_1.default);
app.use("*", error_handler_1.default.pageNotFound);
app.use(error_handler_1.default.errorHandler);
const port = process.env.port || 8080;
app.listen(port, () => {
    console.log(`Server is started at port ${port}`);
});

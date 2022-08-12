import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();

import userRouter from "./routes/user";
import adminRouter from "./routes/admin";
import subAdminRouter from "./routes/sub-admin";
import errorHandler from "./middleware/error-handler";

app.use(express.json());

app.use("/admin", adminRouter);
app.use("/sub-admin", subAdminRouter);
app.use("/user", userRouter);

app.use("*", errorHandler.pageNotFound);

app.use(errorHandler.errorHandler);

const port = process.env.port || 8080;

app.listen(port, () => {
  console.log(`Server is started at port ${port}`);
});

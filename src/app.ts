import dotenv from "dotenv";
dotenv.config();
import express from "express";

const app = express();
const port = process.env.PORT || 3000;

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";


app.use("/users", usersRouter);
app.use("/", indexRouter);


app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
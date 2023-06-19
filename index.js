import Koa from "koa";
import bodyParser from "koa-bodyparser";
import json from "koa-json";
import cors from "@koa/cors";
import dotenv from "dotenv";

import userRouter from "./routes/userRouter.js";

// new koa.js instance
const app = new Koa();

// middlewares
app.use(bodyParser());
app.use(json());
app.use(cors());

// env variables
dotenv.config();

// routes
// app.use(async (ctx) => {
//   ctx.body = "Hello World";
// });
app.use(userRouter.routes()).use(userRouter.allowedMethods()); // registering routes to the application

// server setup
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log("Äpp is Started on port: ", PORT);
});

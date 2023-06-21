import Koa from "koa";
// import bodyParser from "koa-bodyparser";
import { koaBody } from "koa-body";
import json from "koa-json";
// import render from "koa-ejs";
// import path from "path";
// import { fileURLToPath } from "url";
import cors from "@koa/cors";
import dotenv from "dotenv";
// import morgan from "morgan";

import userRouter from "./routes/userRouter.js";

// new koa.js instance
const app = new Koa();

// middlewares
// app.use(bodyParser());
app.use(koaBody({ multipart: true })); // File upload is done through “multipart/form-data”, hence remember to set the {multipart:true} option.
// app.use(koaBody());
app.use(json());
app.use(cors());
// app.use(morgan("dev")); // morgan to format server console logs

// env variables
dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// // console.log('directory-name 👉️', __dirname);
// // console.log(path.join(__dirname, '/views', 'uploadFile.html'));

// render(app, {
//   root: path.join(__dirname, "views"),
//   layout: "uploadFile",
//   viewExt: "html",
// });

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

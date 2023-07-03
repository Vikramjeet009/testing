import koaRouter from "koa-router";

import {
  register,
  login,
  myProfile,
  updateProfile,
  uploadImage,
  getImageURL,
  downloadImage,
  sendEmail,
  sendTemplateEmail,
} from "../controllers/userController.js";
import { auth, validateData } from "../middlewares/index.js";

const userRouter = new koaRouter({ prefix: "/user" });

userRouter.post("/register", validateData, register);
userRouter.post("/login", validateData, login);

userRouter.get("/my-profile", auth, myProfile);
userRouter.post("/update-profile", auth, validateData, updateProfile);

userRouter.post("/upload-image", uploadImage);
userRouter.get("/get-image", getImageURL);
userRouter.post("/download-image", downloadImage);

userRouter.post("/send-email", sendEmail);
userRouter.post("/send-email-template", sendTemplateEmail);

export default userRouter;

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNoeWFta3VtYXIiLCJlbWFpbCI6InNoeWFtM0BtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJiJDEyJFpReFllaUlCeGV2YW9TUExTUVo4WmV2WDMvQ2htMWJ3M1k0RVpsQkZMc3BsbGI0OW1CcXFLIiwiaWF0IjoxNjg2OTA0Njc5fQ.FUITxsdOptWUy8xWSL2LzYf6fp9kYGUDF9sdNOzTNNI

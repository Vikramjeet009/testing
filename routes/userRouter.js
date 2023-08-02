import koaRouter from "koa-router";

import {
  register,
  login,
  myProfile,
  updateProfile,
  uploadImage,
  uploadUrlImage,
  getImageURL,
  getSignedURLs,
  getUnsignedUrl,
  downloadImage,
  deleteImage,
  resizeImage,
  sendEmail,
  sendTemplateEmail,
  mailWithAttachment,
  getFileFromS3UsingCDN,
  deleteFileFromS3,
} from "../controllers/userController.js";
import { auth, validateData } from "../middlewares/index.js";

const userRouter = new koaRouter({ prefix: "/user" });

userRouter.post("/register", validateData, register);
userRouter.post("/login", validateData, login);

userRouter.get("/my-profile", auth, myProfile);
userRouter.post("/update-profile", auth, validateData, updateProfile);

userRouter.post("/upload-image", uploadImage);
userRouter.get("/upload-image-via-url", uploadUrlImage);
userRouter.get("/get-image", getImageURL);
userRouter.get('/get-images', getSignedURLs);
userRouter.get('/get-unsigned-url', getUnsignedUrl);
userRouter.post("/download-image", downloadImage);
userRouter.get("/delete-image", deleteImage);
userRouter.get("/resize-image", resizeImage);

userRouter.post("/send-email", sendEmail);
userRouter.post("/send-email-template", sendTemplateEmail);
userRouter.post("/send-email-with-attachment", mailWithAttachment);

userRouter.get("/aws-cdn", getFileFromS3UsingCDN);


// delete file from s3 and invalidate cloudfront 
userRouter.get("/delete-file", deleteFileFromS3);

export default userRouter;

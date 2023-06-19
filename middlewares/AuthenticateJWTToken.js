import jwt from "jsonwebtoken";

export const auth = async (ctx, next) => {
  try {
    const token = ctx.get("Authorization");
    // console.log("auth token : ", token);

    if (!token) {
      ctx.status = 400;
      ctx.body = "Invalid Authentication";
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    ctx.request.user = decoded;

    await next();
  } catch (error) {
    // console.log("auth error : ",error)
    ctx.status = 500;
    ctx.body = error.message;
    return;
  }
};

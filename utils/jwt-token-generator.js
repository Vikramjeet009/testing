import jwt from "jsonwebtoken";

export const createAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_TOKEN_SECRET
    // , { expiresIn: "30m" }
  );
};

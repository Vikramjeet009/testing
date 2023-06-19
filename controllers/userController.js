import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

import { createAccessToken, hashPassword } from "../utils/index.js";

const prisma = new PrismaClient();

// Using ctx.request , We can request any type of data. (examples: ctx.request.body, ctx.request.params.email, ctx.request.headers)
// Using ctx.body , We can assign any type of data as a response.
// Using ctx.status , We can assign the response HTTP status.

export const register = async (ctx) => {
  try {
    const user = await ctx.request.body;
    const { username, email, password } = user;
    // console.log("user : ", user);

    let existingUser = await prisma.User.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existingUser) {
      ctx.body = "User already exists";
      ctx.status = 404;
      return;
    } else {
      const data = {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: await hashPassword(password),
      };

      // insert data in DB
      const recordCreated = await prisma.User.create({
        data,
      });

      // jwt access token
      const token = createAccessToken({
        id: recordCreated.id,
        email: recordCreated.email,
        username: recordCreated.username,
      });

      ctx.status = 200;
      ctx.body = {
        message: "Registration Successfull !!! , Please Login :)",
        token,
      };
    }
  } catch (error) {
    ctx.body = error;
    ctx.status = 500;
    console.log("error : ", error);
  }
};

export const login = async (ctx) => {
  try {
    const user = await ctx.request.body;
    const { email, password } = user;
    // console.log("user : ", user);

    const userFound = await prisma.User.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!userFound) {
      ctx.status = 400;
      ctx.body = "No user with the given Email";
      return;
    }

    const passwordValidate = await bcrypt.compare(password, userFound.password);

    if (!passwordValidate) {
      ctx.status = 400;
      ctx.body = "Invalid Password";
      return;
    }

    // jwt access token
    const token = createAccessToken({
      id: userFound.id,
      email: userFound.email,
      username: userFound.username,
    });

    ctx.status = 200;
    ctx.body = {
      message: "Login Successful :)",
      token,
    };
  } catch (error) {
    console.log(error);
    ctx.body = error.message;
    ctx.status = 500;
  }
};

// user details
export const myProfile = async (ctx) => {
  try {
    const user = await ctx.request.user;
    const { id } = user;

    const myProfile = await prisma.User.findUnique({
      where: {
        id: id,
      },
    });

    if (!myProfile) {
      ctx.status = 400;
      ctx.body = "User does not exists";
      return;
    }

    ctx.status = 200;
    ctx.body = {
      message: "User details found",
      user: {
        username: myProfile.username,
        email: myProfile.email,
      },
    };
  } catch (error) {
    console.log(error);
    ctx.body = error.message;
    ctx.status = 500;
  }
};

// update user details
export const updateProfile = async (ctx) => {
  try {
    const user = await ctx.request.user;
    const { id } = user;

    const userFound = await prisma.User.findUnique({
      where: {
        id: id,
      },
    });

    if (!userFound) {
      ctx.status = 400;
      ctx.body = "User does not exists.";
      return;
    }

    const bodyRespose = await ctx.request.body;
    const { username, email } = bodyRespose;

    await prisma.User.update({
      where: {
        id: id,
      },
      data: {
        username,
        email,
      },
    });

    ctx.status = 200;
    ctx.body = {
      message: "User profile updated successfully",
    };
  } catch (error) {
    console.log(error);
    ctx.body = error.message;
    ctx.status = 500;
  }
};

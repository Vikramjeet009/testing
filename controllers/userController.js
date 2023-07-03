import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import fs from "fs";
import AWS from "aws-sdk";
import archiver from "archiver";
import nodemailer from "nodemailer";

import { AWS_CONFIG } from "../config/keys.js";

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

export const uploadImage = async (ctx) => {
  // const { filesData: files, folderName } = ctx.request.body;
  const files = ctx.request.files.file; // file is the attribute/input name in your frontend app "Form-Data"
  // console.log("files : ", files);

  const myFiles = Array.isArray(files)
    ? files
    : typeof files === "object"
    ? [files]
    : null; // to handle single file and multiple files
  // console.log("myFiles : ", myFiles);

  if (myFiles) {
    try {
      const filePromises = myFiles.map(async (file) => {
        const s3 = new AWS.S3(AWS_CONFIG);

        //   var { path, name, type } = file;
        var { filepath, newFilename, originalFilename, mimetype } = file;
        // console.log(filepath, newFilename, originalFilename, mimetype)

        const body = fs.createReadStream(filepath);

        const params = {
          Bucket: `${process.env.AWS_S3_BUCKET_NAME}/vikram`,
          Key: originalFilename,
          Body: body,
          ContentType: mimetype,
        };

        // const data = await s3.upload(params);
        // console.log("data : ", data);

        return new Promise(function (resolve, reject) {
          s3.upload(params, function (error, data) {
            if (error) {
              reject(error);
              return;
            }

            if (data) {
              console.log(data);
              // {
              //   ETag: '"522c144642b3596cc5457f600cc815ad"',
              //   ServerSideEncryption: 'AES256',
              //   Location: 'https://qafto-testing-s3-bucket.s3.amazonaws.com/Screenshot%20from%202023-06-21%2009-28-08.png',
              //   key: 'Screenshot from 2023-06-21 09-28-08.png',
              //   Key: 'Screenshot from 2023-06-21 09-28-08.png',
              //   Bucket: 'qafto-testing-s3-bucket'
              // }
              resolve(data);
              return;
            }
          });
        });
      });

      var results = await Promise.all(filePromises);
      ctx.body = results;

      // ctx.status = 200;
      // ctx.body = "file uploaded!";
    } catch (error) {
      console.error(error);
      ctx.status = 500;
      ctx.body = error;
    }
  }
};

export const downloadImage = async (ctx) => {
  // const fileNames = ["Screenshot from 2023-06-20 17-59-11.png", "Readme.md"];

  const fileNames = ctx.request.body;
  console.log("fileNames : ", fileNames);

  const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const zipFileName = "myfiles.zip";
  const zipFile = fs.createWriteStream(`./public/downloads/${zipFileName}`);
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  archive
    .on("warning", (err) => {
      if (err.code === "ENOENT") {
        // log warning
        console.log(`File does not exist.`, err);
      } else {
        throw err;
      }
    })
    .on("error", (err) => {
      throw err;
    })
    .pipe(zipFile);

  zipFile.on("close", () => {
    console.log(archive.pointer(), "total bytes" + zipFile.path);
    zipFile.end();
    console.log("zip files created successfully.");
  });

  for (const key of Object.keys(fileNames)) {
    // fileNames.forEach((file) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileNames[key],
    };

    const s3Stream = s3.getObject(params).createReadStream();
    archive.append(s3Stream, { name: fileNames[key] });
    // });
  }

  await archive.finalize();

  ctx.response.set(
    "Content-disposition",
    `attachment; filename=${zipFileName}`
  );

  ctx.body = fs.createReadStream(zipFile.path);
  // fs.unlinkSync(zipFile.path);     // remove file from server when user downloaded
};

export const getImageURL = async (ctx) => {
  // https://<bucket>.s3.<region>.amazonaws.com/<key>
  
  // const { key } = ctx.request.body;
  
  try {
    const s3 = new AWS.S3(AWS_CONFIG);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: "vikram/reset_root.png",
      Expires: 60 * 5
    };
    const fileData = s3.getSignedUrl('getObject', params);

    ctx.status = 200;
    ctx.body = { url: fileData, message: "Signed Url" };
  } catch (error) {
    ctx.status = 200;
    ctx.body = "Error while getting signed url.";
  }
};

export const sendEmail = async (ctx) => {
  const { recipientEmail, name } = ctx.request.body;
  
  try {
    let params = {
      Source: process.env.AWS_SES_SENDER,
      Destination: {
        ToAddresses: [
          recipientEmail
        ],
      },
      ReplyToAddresses: [],
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: 'This is the body of my email!',
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: `Hello, ${name}!`,
        }
      },
    };
    
    const AWS_SES = new AWS.SES(AWS_SES_CONFIG);
    
    AWS_SES.sendEmail(params).promise();
    
    ctx.status = 200;
    ctx.body = "Email Sent.";

  } catch (error) {
    console.log("error : ", error)
    ctx.status = 400;
    ctx.body = "Email not Sent.";
  }
}

export const sendTemplateEmail = async (ctx) => {
  const { recipientEmail, name, favoriteanimal } = ctx.request.body;
  
  try{
    let params = {
      Source: process.env.AWS_SES_SENDER,
      Template: "MyTemplate",
      Destination: {
        ToAddresses: [ 
          recipientEmail
        ]
      },
      TemplateData: `{ \"name\":\"${name}\", \"favoriteanimal\":\"${favoriteanimal}\" }`
    };
    
    const AWS_SES = new AWS.SES(AWS_CONFIG);
    
    AWS_SES.sendTemplatedEmail(params).promise();
    
    ctx.status = 200;
    ctx.body = "Email Sent.";
    
  } catch (error) {
    console.log("error : ", error)
    ctx.status = 400;
    ctx.body = "Email not Sent.";
  }
};

function getS3File(key) {
  const s3 = new AWS.S3(AWS_CONFIG);
  
  return new Promise(function (resolve, reject) {
    s3.getObject(
      {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `vikram/${key}`
      },
      function (err, data) {
        if (err) return reject(err);
        else return resolve(data);
      }
    );
  })
}

export const mailWithAttachment = async (ctx) => {
  const { recipientEmail } = ctx.request.body;
  
  getS3File('reset_root.png')
    .then(function (fileData) {
      var mailOptions = {
        from: process.env.AWS_SES_SENDER,
        subject: 'This is an email sent for testing purpose with attachment!',
        html: `<p>You got a contact message from: <b>${process.env.AWS_SES_SENDER}</b></p>`,
        to: recipientEmail,
        // bcc: Any BCC address you want here in an array,
        attachments: [
          {
            filename: "An Attachment.pdf",
            content: fileData.Body
          }
        ]
      };

      const AWS_SES = new AWS.SES(AWS_CONFIG);
      
      // console.log('Creating SES transporter');
      // create Nodemailer SES transporter
      var transporter = nodemailer.createTransport({
        SES: AWS_SES
      });

      // send email
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.log("Error sending email", err);
          ctx.status = 400;
          ctx.body = "Error sending email";
        } else {
          console.log('Email sent successfully');
          ctx.status = 200;
          ctx.body = "Email sent successfully";
        }
      });
    })
    .catch(function (error) {
      console.log("Error getting attachment from S3", error);
      ctx.status = 400;
      ctx.body = "Error getting attachment from S3";
    });
};
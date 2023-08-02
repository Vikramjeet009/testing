import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import fs from "fs";
import AWS from "aws-sdk";
import archiver from "archiver";
import nodemailer from "nodemailer";
// import mime from "mime-types";
import pkg from "file-type";
// import { fromBuffer } from "file-type";
import axios from "axios";
import sharp from "sharp";
import got from "got";

import { AWS_CONFIG, AWS_CLOUDFRONT_CONFIG } from "../config/keys.js";

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

        const passwordValidate = await bcrypt.compare(
            password,
            userFound.password
        );

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
    console.log("myFiles : ", myFiles);

    if (myFiles) {
        try {
            const s3 = new AWS.S3(AWS_CONFIG);
            const filePromises = myFiles.map(async (file) => {
                //   var { path, name, type } = file;
                var { filepath, newFilename, originalFilename, mimetype } =
                    file;
                // console.log(filepath, newFilename, originalFilename, mimetype)
                // filepath: '/tmp/ea7528da1baa65788e5f3f400',
                // newFilename: 'ea7528da1baa65788e5f3f400',
                // originalFilename: 'Screenshot from 2022-10-10 10-20-56.png',
                // mimetype: 'image/png',

                const body = fs.createReadStream(filepath);
                // console.log('body : ', body);

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
                            // console.log(data);
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
            console.log(results);
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

export const deleteImage = async (ctx) => {
    try {
        const s3 = new AWS.S3(AWS_CONFIG);

        const params = {
            Bucket: "qafto-testing/images",
            Key: "a55f50f232a73b3e8a52b7d00", // 'images/reset_root.png'
        };

        s3.deleteObject(params, function (error, data) {
            if (error) {
                console.log(error);
                // reject(error);
                return error;
            }

            if (data) {
                console.log(data);
                /* response after delete
          { DeleteMarker: true, VersionId: 'null' }
        */
            }
        });
    } catch (error) {
        return "Error while getting signed url.";
    }
};

export const getImageURL = async (ctx) => {
    // https://<bucket>.s3.<region>.amazonaws.com/<key>

    // const { key } = ctx.request.body;

    try {
        const s3 = new AWS.S3(AWS_CONFIG);

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: "vikram/reset_root",
            Expires: 60 * 5,
        };
        const fileData = s3.getSignedUrl("getObject", params);

        ctx.status = 200;
        ctx.body = { url: fileData, message: "Signed Url" };
    } catch (error) {
        ctx.status = 200;
        ctx.body = "Error while getting signed url.";
    }
};

export const getSignedURLs = async (ctx) => {
    try {
        const fileName = [
            "images/70348e05afb76c7902fa85700",
            "images/70348e05afb76c7902fa85701",
        ];

        let signedURL = [];

        for (let i = 0; i < fileName.length; i++) {
            // images/6b528121feb70a93d82b80101
            const split_filename = fileName[i].split("/");

            const filename = split_filename[1];
            let folderName = "";

            if (split_filename[0] == "images") {
                folderName = "images";
            } else if (split_filename[0] == "videos") {
                folderName = "videos";
            } else if (split_filename[0] == "uploads") {
                folderName = "uploads";
            } else {
                return "invalid image format";
            }

            const s3 = new AWS.S3(AWS_CONFIG);

            const params = {
                Bucket: "qafto-testing/images",
                Key: filename, // 'images/reset_root.png'
                Expires: 30 * 60, // 30 minutes
            };

            const signedURLs = s3.getSignedUrl("getObject", params);
            // console.log(signedURL)
            signedURL.push(signedURLs);
            /* Eg :
        https://qafto-testing.s3.ap-south-1.amazonaws.com/vikram/reset_root?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIASKKJRWLSQXNIGVNG%2F20230725%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20230725T050612Z&X-Amz-Expires=300&X-Amz-Signature=4ac6bcb1263c92b918e4cbfdd5bcf2f53a1191f97a521331d48fb189bbca07cd&X-Amz-SignedHeaders=host
      */
        }
        // console.log(signedURL);
        ctx.status = 200;
        ctx.body = signedURL;
    } catch (error) {
        return "Error while getting signed url.";
    }
};

// code is working, but update policy
export const getUnsignedUrl = async (ctx) => {
    const s3 = new AWS.S3(AWS_CONFIG);

    const params = {
        Bucket: "qafto-testing/images",
        Key: "images/70348e05afb76c7902fa85700", // 'images/reset_root.png'
        // Expires: 30 * 60,					// 30 minutes
    };

    s3.getObject(params, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log("Successfully dowloaded data from  bucket");
            console.log(data);
        }
    });
};

export const uploadUrlImage = async (ctx) => {
    try {
        // const url =
        //     "https://cdn.pixabay.com/photo/2017/02/01/22/02/mountain-landscape-2031539_1280.jpg";

        const url =
            "https://lh3.googleusercontent.com/a/AAcHTtc9lqfXlALiGo3n3vJMpRrdREhhcsfsAmzFyxMyaqnQqog=s96-c";

        // const url = '/home/coder_360/Pictures/Screenshot from 2023-05-30 15-35-05.png';
        // const url = '/home/coder_360/Downloads/Insomnia.Core-2023.2.2.deb';
        // const url = '/home/coder_360/Downloads/priority_plans.sql';
        // const url = '/home/coder_360/Downloads/RemixIcon_SVG_2307201901.zip';

        // const metadata = await exifr.parse(url);
        // console.log(metadata);

        // console.log('data : ', data);
        // console.log('headers : ', headers['content-type']);
        // console.log(await fileTypeFromFile(data));

        // console.log(await fileTypeFromStream(data));
        console.log(mime.lookup(url));

        const { data } = await axios.get(url, { responseType: "arraybuffer" });

        // console.log(data);

        const { fromBuffer } = pkg;
        // const metaData = await fileTypeFromStream(data);
        const metaData = await fromBuffer(data);
        // { ext: 'jpg', mime: 'image/jpeg' }

        console.log(metaData);

        const type = metaData?.mime.split("/")[0];

        let folderName = "";

        if (type == "image") {
            folderName = "images";
        } else if (type == "video") {
            folderName = "videos";
        } else if (type == "audio") {
            folderName = "audios";
        } else if (type == "application") {
            folderName = "documents";
        } else {
            return "invalid image format";
        }

        const random_img_name =
            Date.now().toString(36) + Math.random().toString(36).substring(2);

        const s3 = new AWS.S3(AWS_CONFIG);

        const upload = await s3
            .upload({
                Bucket: `qafto-testing/${folderName}`,
                Key: random_img_name, // lkm95zj5nkrm1ivau4i
                Body: data,
            })
            .promise();

        ctx.body = upload;
    } catch (error) {
        console.log(error);
    }
};

const getSignedURL = async (fileName) => {
    try {
        // console.log(fileName)
        // images/6b528121feb70a93d82b80101
        const split_filename = fileName.split("/");

        const filename = split_filename[1];
        let folderName = "";

        if (split_filename[0] == "images") {
            folderName = "images";
        } else if (split_filename[0] == "videos") {
            folderName = "videos";
        } else if (split_filename[0] == "uploads") {
            folderName = "uploads";
        } else {
            return "invalid image format";
        }

        const s3 = new AWS.S3(AWS_CONFIG);

        const params = {
            Bucket: `qafto-testing/${folderName}`,
            Key: filename, // 'images/reset_root.png'
            Expires: 30 * 60, // 30 minutes
        };

        const signedURL = s3.getSignedUrl("getObject", params);
        // console.log(signedURL)
        return signedURL;

        /* Eg :
            https://qafto-testing.s3.ap-south-1.amazonaws.com/vikram/reset_root?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIASKKJRWLSQXNIGVNG%2F20230725%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20230725T050612Z&X-Amz-Expires=300&X-Amz-Signature=4ac6bcb1263c92b918e4cbfdd5bcf2f53a1191f97a521331d48fb189bbca07cd&X-Amz-SignedHeaders=host
        */
    } catch (error) {
        return "Error while getting signed url.";
    }
};

export const resizeImage = async (ctx) => {
    try {
        const queryData = ctx.request.query;
        // console.log("queryData : ", queryData);

        let imageName = queryData.name;
        let width = parseInt(queryData.width);
        let height = parseInt(queryData.height);

        const signedURL = await getSignedURL(`images/${imageName}`);
        // console.log(signedURL);

        const { data } = await axios.get(signedURL, {
            responseType: "arraybuffer",
        });

        // var transformer = await sharp(data)
        //     .resize(width, height)
        //     // .toFile("output.png");
        //     .toFormat("jpeg")
        //     .toBuffer();

        var transformer = sharp()
            .resize(width, height)
            // .toFile("output.png");
            .on("info", function (outputBuffer) {
                // outputBuffer contains JPEG image data
                // no wider and no higher than 200 pixels
                // and no larger than the input image
                // console.log(outputBuffer);
                return outputBuffer;
            });

        // const imageBase64 = `data:image/png;base64,${transformer.toString('base64')}`;

        // console.log("transformer : ", transformer);
        // console.log(imageBase64);
        // console.log("transformer : ", imagefrombuffer({...transformer}));
        // ctx.status = 200;
        // ctx.body = { data: imageBase64 };

        // ctx.body = imageBase64;
        ctx.body = transformer;

        // return imageBase64;
        // .on("info", function (info) {
        //     // console.log('Image height is ' + info.height);
        //     console.log("Image height is ");
        // });

        // readableStream.pipe(transformer).pipe(writableStream);
        // ctx.body = transformer;
        // /********* Using GOT */
        got.stream(signedURL).pipe(transformer).pipe(ctx.body);
    } catch (error) {
        console.log("error : ", error);
    }
};

export const sendEmail = async (ctx) => {
    const { recipientEmail, name } = ctx.request.body;

    try {
        let params = {
            Source: process.env.AWS_SES_SENDER,
            Destination: {
                ToAddresses: [recipientEmail],
            },
            ReplyToAddresses: [],
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: "This is the body of my email!",
                    },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: `Hello, ${name}!`,
                },
            },
        };

        const AWS_SES = new AWS.SES(AWS_SES_CONFIG);

        AWS_SES.sendEmail(params).promise();

        ctx.status = 200;
        ctx.body = "Email Sent.";
    } catch (error) {
        console.log("error : ", error);
        ctx.status = 400;
        ctx.body = "Email not Sent.";
    }
};

export const sendTemplateEmail = async (ctx) => {
    const { recipientEmail, name, favoriteanimal } = ctx.request.body;

    try {
        let params = {
            Source: process.env.AWS_SES_SENDER,
            Template: "MyTemplate",
            Destination: {
                ToAddresses: [recipientEmail],
            },
            TemplateData: `{ \"name\":\"${name}\", \"favoriteanimal\":\"${favoriteanimal}\" }`,
        };

        const AWS_SES = new AWS.SES(AWS_CONFIG);

        AWS_SES.sendTemplatedEmail(params).promise();

        ctx.status = 200;
        ctx.body = "Email Sent.";
    } catch (error) {
        console.log("error : ", error);
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
                Key: `vikram/${key}`,
            },
            function (err, data) {
                if (err) return reject(err);
                else return resolve(data);
            }
        );
    });
}

export const mailWithAttachment = async (ctx) => {
    const { recipientEmail } = ctx.request.body;

    getS3File("reset_root.png")
        .then(function (fileData) {
            var mailOptions = {
                from: process.env.AWS_SES_SENDER,
                subject:
                    "This is an email sent for testing purpose with attachment!",
                html: `<p>You got a contact message from: <b>${process.env.AWS_SES_SENDER}</b></p>`,
                to: recipientEmail,
                // bcc: Any BCC address you want here in an array,
                attachments: [
                    {
                        filename: "An Attachment.pdf",
                        content: fileData.Body,
                    },
                ],
            };

            const AWS_SES = new AWS.SES(AWS_CONFIG);

            // console.log('Creating SES transporter');
            // create Nodemailer SES transporter
            var transporter = nodemailer.createTransport({
                SES: AWS_SES,
            });

            // send email
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log("Error sending email", err);
                    ctx.status = 400;
                    ctx.body = "Error sending email";
                } else {
                    console.log("Email sent successfully");
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

// get file from s3 bucket using cloudfront cdn (signed)
export const getFileFromS3UsingCDN = async (ctx) => {
    try {
        // const cloudFront = new AWS.CloudFront.Signer(AWS_CLOUDFRONT_CONFIG);
        const cloudFront = new AWS.CloudFront.Signer(
            process.env.AWS_CLOUDFRONT_PUBLIC_KEY_ID,
            process.env.AWS_CLOUDFRONT_PRIVATE_KEY
        );

        cloudFront.getSignedUrl(
            {
                url: `https://${process.env.AWS_CLOUDFRONT_DOMAIN_NAME}/canonical.png`,
                expires: Math.floor(new Date().getTime() / 1000) + 60 * 60 * 1, // Current Time in UTC + time in seconds, (60 * 60 * 1 = 1 hour)
            },
            (err, url) => {
                if (err) {
                    console.log("error : ", err);
                    ctx.status = 400;
                    ctx.body = { err, message: "Failed" };
                }
                // console.log(url);

                ctx.status = 200;
                ctx.body = { url, message: "Success" };
            }
        );
    } catch (error) {
        console.log("error : ", error);
        ctx.status = 400;
        ctx.body = "Failed.";
    }
};

export const deleteFileFromS3 = async (ctx) => {
    try {
        const s3 = new AWS.S3(AWS_CONFIG);
        const cloudFront = new AWS.CloudFront(AWS_CLOUDFRONT_CONFIG);

        const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: "canonical.png",
        };

        s3.deleteObject(deleteParams, (error, data) => {
            if (error) {
                console.log("Error: Object delete failed.", error);
                ctx.status = 400;
                ctx.body = "Failed.";
            }
        });

        const invalidateCloudFrontParams = {
            DistributionId: process.env.AWS_CLOUDFRONT_DESTRIBUTION_ID,
            InvalidationBatch: {
                CallerReference: "canonical.png",
                Paths: {
                    Quantity: 1,
                    Items: ["/canonical.png"],
                },
            },
        };

        // TODO : not working
        cloudFront.createInvalidation(
            invalidateCloudFrontParams,
            (error, data) => {
                if (error) {
                    console.log("Error: Object invalidation failed.", error);
                    ctx.status = 400;
                    ctx.body = "Failed.";
                }
            }
        );

        ctx.status = 200;
        ctx.body = "File Deleted and Cloudfront is invalidated.";
    } catch (error) {
        console.log("error : ", error);
        ctx.status = 400;
        ctx.body = "Failed.";
    }
};

import fs from "fs";
import AWS from "aws-sdk";
import dotenv from "dotenv";

// env variables
dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const fileName = "Readme.md";

const uploadFile = () => {
  fs.readFile(fileName, (err, data) => {
    if (err) throw err;
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME, // pass your bucket name
      Key: "Readme.md", // file will be saved as testBucket/contacts.csv
      Body: JSON.stringify(data, null, 2),
    };
    s3.upload(params, function (s3Err, data) {
      if (s3Err) throw s3Err;
      console.log(`File uploaded successfully at ${data.Location}`);
    });
  });
};

uploadFile();

// const filename = "Readme.md";
// const content = fs.readFileSync(filename);

// const params = {
//   Bucket: process.env.AWS_S3_BUCKET_NAME,
//   Key: filename,
//   Body: content,
// };

// s3.upload(params, (error, data) => {
//   if (error) {
//     console.log("error : ", error);
//   }
//   if (data) {
//     console.log("success : ", data.Location);
//   }
// });

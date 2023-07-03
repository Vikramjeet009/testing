import AWS from "aws-sdk";
import dotenv from "dotenv";

// env variables
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

console.log('process.env.AWS_REGION', process.env.AWS_REGION)

const SES = new AWS.SES(); 

const params = {
  "Template": {
    "TemplateName": "MyTemplate",
    "SubjectPart": "Greetings, {{name}}!",
    "HtmlPart": "<h1>Hello {{name}},</h1><p>Your favorite animal is {{favoriteanimal}}.</p>",
    "TextPart": "Dear {{name}},\r\nYour favorite animal is {{favoriteanimal}}."
  }
}

SES.createTemplate(params, (err, data) =>  {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
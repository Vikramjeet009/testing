use koa-body which provides support for multipart, urlencoded, and json request bodies. Provides the same functionality as Express's bodyParser - multer.

# PRISMA

onDelete: Cascade - Deleting a referenced record will trigger the deletion of referencing record.

@@id([authorId, postId], name: "authorPostId") -
Using the @@id you indicated to prisma that the NewTable had a primary key composed by this two fields,

We've also passed it an optional name parameter to name the newly created field

# ERROR

Error: P1000: Authentication failed against database server at `localhost`, the provided database credentials for `postgres` are not valid.
Please make sure to provide valid database credentials for the database server at `localhost`.

Solution: sudo systemctl start postgresql.service


# AWS SES

https://betterprogramming.pub/how-to-send-emails-with-node-js-using-amazon-ses-8ae38f6312e4

https://medium.com/@charithwick/sending-emails-using-aws-ses-nodejs-460b8cc6d0d5


for templates install aws-cli in ubuntu

# AWS SES with Nodemailer for attachments

https://technotrampoline.com/articles/how-to-use-aws-ses-with-nodemailer/

https://medium.com/@xoor/sending-emails-with-attachments-with-aws-lambda-and-node-js-e6a78500227c



# AWS S3 

while creating bucket make sure to enable versioning


# AWS CLOUDFRONT (CDN)

Follow this playlist - https://youtube.com/playlist?list=PL0X6fGhFFNTeGDRuMlQBO1fs4vvQA48tM


create cloudfront cdn - https://www.youtube.com/watch?v=kbI7kRWAU-w

after creating cdn, update the s3 bucket policy, copy policy statement and paste it in "Bucket policy"

policy statement will be like this -
{
    "Version": "2008-10-17",
    "Id": "PolicyForCloudFrontPrivateContent",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::qafto-testing/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::159604912869:distribution/E3S9KR2WJ3S5FZ"
                }
            }
        }
    ]
}

Now you can access any s3 bucket object like this - 

https://cdn_domain_name/file_name_in_bucket



Created signed CDN urls

Watch - https://www.youtube.com/watch?v=EIYrhbBk7do


create public-private key either via going to Kamal Deep > Security Credentials (CloudFront key pairs)
or open ssl (cli based)


Upload key to CloudFront under Key management (left side panel) > Public Keys
after that create a Key groups & select above created key in it

copy ID of newly created public key & paste it in .env (it will be used as public key reference) 


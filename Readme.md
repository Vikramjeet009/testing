use koa-body which provides support for multipart, urlencoded, and json request bodies. Provides the same functionality as Express's bodyParser - multer.

# PRISMA

Generate ERD Diagram : npx prisma generate
or online throught : https://prisma-erd.simonknott.de/

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


# Generate AWS Access Key and Secret
    1. Login to Account
    2. Click on top-right corner dropdown and select Security Credentials
    3. Scroll down and search fot Access Keys
    4. Clik on Create access key to generate new access key and secret
    Note: do not create access key and secret from root account as it may cause some security problems


# AWS S3 

while creating bucket make sure to enable versioning


# connect aws with strapi
    go to Permissions tab and edit
    
    1. Block public access (bucket settings)
        check last 2 optiona only i.e.
            Block public access to buckets and objects granted through new public bucket or access point policies
            &
            Block public and cross-account access to buckets and objects through any public bucket or access point policies

    2. Edit Object Ownership and select ACLs enabled

    3. Edit Cross-origin resource sharing (CORS), paste below code
        [
            {
                "AllowedHeaders": [
                    "*"
                ],
                "AllowedMethods": [
                    "GET"
                ],
                "AllowedOrigins": [
                    "http://localhost:1337",
                    "https://app.qafto.com"
                ],
                "ExposeHeaders": [],
                "MaxAgeSeconds": 3000
            }
        ]

# steps to configure strapi

    1. install @strapi/provider-upload-aws-s3 package in strapi
    
    2. create plugins.js file inside config folder & paste below code in it
        
        module.exports = ({ env }) => ({
            // aws s3 plugin
            upload: {
                config: {
                    provider: 'aws-s3',
                    providerOptions: {
                        // set base cdn url, it will return files by attaching specified cdn url to it
                        // eg: https://usercdn.qafto.com/folder_name/media_name (with or without extension)
                        baseUrl: env('CDN_URL'),

                        // upload files in specified folder, eg: folder_1/media_name
                        rootPath: `${env('UNIQUE_USER_ID')}/`,

                        accessKeyId: env('AWS_ACCESS_KEY_ID'),
                        secretAccessKey: env('AWS_ACCESS_SECRET'),
                        region: env('AWS_REGION'),
                        params: {
                            ACL: env('AWS_ACL', 'public-read'),
                            signedUrlExpires: env('AWS_SIGNED_URL_EXPIRES', 15 * 60),
                            Bucket: env('AWS_BUCKET'),
                        },
                    },
                    actionOptions: {
                        upload: {},
                        uploadStream: {},
                        delete: {},
                    },
                    breakpoints: {        // un-comment to generate images based on breakpoints
                        // xlarge: 1920,
                        // large: 1000,
                        // medium: 750,
                        // small: 500,
                        // xsmall: 64
                    },
                },
            },
        });


        above code will prevent from uploading multiple image formats to strapi (large, medium, small), but to avoid uploading thumbnail format
        create a file inside src > extensions > upload > strapi-server.js , copy & paste below code in that file
        
        // avoid uploading thumbnail when uploading image
        module.exports = (plugin) => {
            var imageManipulation = plugin.services['image-manipulation'];
            plugin.services['image-manipulation'] = () => {
                return {
                    ...imageManipulation(),
                    generateThumbnail: () => { }
                };
            };
            return plugin;
        };


# AWS CLOUDFRONT (CDN)

Follow this playlist - https://youtube.com/playlist?list=PL0X6fGhFFNTeGDRuMlQBO1fs4vvQA48tM


create cloudfront cdn - https://www.youtube.com/watch?v=kbI7kRWAU-w

when creating cloudfron cdn distribution follow these points
    - select Origin access control settings (recommended) option in Origin access, select bucket related control setting or
            create new one by clicking on Create Control Setting button.
    - update the s3 bucket policy, copy policy statement and paste it in "Bucket policy"
    - select Redirect HTTP to HTTPS option in Viewer
    - select Web Application Firewall (WAF) > Do not enable security protections


create new bucket with 
    - Block public access (bucket settings) - block all
    - Object Ownership - ACLs disabled (recommended)


or follow this article - https://www.stormit.cloud/blog/cloudfront-origin-access-control/
https://www.velotio.com/engineering-blog/s3-cloudfront-to-deliver-static-asset

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

https://cdn_domain_name/folder_name/file_name_in_bucket




# connect custom domain name to cloudfront cdn distribution


CloudFront
    Amazon CloudFront is a content delivery network (CDN) that speeds up the delivery of your static and dynamic web content, such as HTML, CSS, JavaScript, and images, to your users. CloudFront caches your content at edge locations around the world, so your users can access it quickly and reliably. This reduces latency and improves the user experience.

Route53
    Amazon Route53 is a scalable and highly available Domain Name System (DNS) service that translates domain names, such as example.com, into IP addresses that computers use to connect to each other over the internet. Route53 also supports domain registration and health checking.



-> if you purchased domain from aws follow below steps


https://www.youtube.com/watch?v=M0GfSXr75iU
https://www.youtube.com/watch?v=ookzXuMr8eY&list=PLNk96vmHRIyBff3nVjrMwrctTBdEMFgRg&index=3


2 steps to do 
    1. create ACM certificate
    2. create hosted zone in route 53
    

Search AWS Certificate Manager (ACM) in search box
    # Important : make sure you create ACM certificate in US East (N. Virginia) (us-east-1) region else it will not work. Because, CloudFront being an AWS service which is not tied to any specific region, it will use the certificates from US East region only.
    
    - Request certificate > choose Request a public certificate
    - enter domain or sub-domain name for which you want to get certificate
    - select DNS validation - recommended in Validation method
    
certificate is created & its status is Pending validation
    - copy CNAME name & CNAME value and create a CNAME record in DNS provides
        CNAME name : _9caedb51d06ea3fe2fba3b78193cfa4e.cdn.qafto.com.
        CNAME value : _ceefedd20d1c034f66854ef15cdb3404.vkznmzfykm.acm-validations.aws.

        add value like this
        CNAME name : _9caedb51d06ea3fe2fba3b78193cfa4e.cdn
        CNAME value : _ceefedd20d1c034f66854ef15cdb3404.vkznmzfykm.acm-validations.aws
        
search Route 53
    - Hosted zones > Create Hosted zone
    - enter domain name (not sub domain name)
    
    go back to acm certificate
        - Click on Create record in Route 53 button


    When ACM certificate's status changes to Issued
        - go back to cloudfront cdn distribution
        - add Alternate domain name (CNAME) - optional
        - add or select Custom SSL certificate - optional
        - save changes
        
    Go back to Route 53
        - create new record
        - enter sub-domain name
        - Record type : A - Routes traffic to an IPv4 address and some AWS resources
        - enable Alias
        - select Alias to Cloudfront distribution in Choose endpoint section
        - select cloudfront cdn distribution in Choose distribution section
        - create record
    
    
    
    
    
    
-> If domain is purchased from other dns servers then follow below steps

https://www.youtube.com/watch?v=WGvxnfZjV8g

OR follow below steps
    
Search AWS Certificate Manager (ACM) in search box
    # Important : make sure you create ACM certificate in US East (N. Virginia) (us-east-1) region else it will not work. Because, CloudFront being an AWS service which is not tied to any specific region, it will use the certificates from US East region only.
    
    - Request certificate > choose Request a public certificate
    - enter domain or sub-domain name for which you want to get certificate
    - select DNS validation - recommended in Validation method
    
certificate is created & its status is Pending validation
    - copy CNAME name & CNAME value and create a CNAME record in DNS provides
        CNAME name : _9caedb51d06ea3fe2fba3b78193cfa4e.cdn.qafto.com.
        CNAME value : _ceefedd20d1c034f66854ef15cdb3404.vkznmzfykm.acm-validations.aws.

        add value like this
        CNAME name : _9caedb51d06ea3fe2fba3b78193cfa4e.cdn
        CNAME value : _ceefedd20d1c034f66854ef15cdb3404.vkznmzfykm.acm-validations.aws
    
    edit newly created distribution
        Settings > Edit
        - Add Item in Alternate domain name (CNAME) - optional, enter domain name
        - choose ssl certifiate > Custom SSL certificate - optional
    
    when certificate is issued, create 1 more CNAME record in DNS provider
    
        add value like this
        CNAME name : cdn (sub-domain name only)
        CNAME value : d3scn93lypf6f2.cloudfront.net (cloudfront distribution default domain name)
        
    wait for some 10-15 min and cdn will be active

        
    
Created signed CDN urls

Watch - https://www.youtube.com/watch?v=EIYrhbBk7do


create public-private key either via going to Kamal Deep > Security Credentials (CloudFront key pairs)
or open ssl (cli based)


Upload key to CloudFront under Key management (left side panel) > Public Keys
after that create a Key groups & select above created key in it

copy ID of newly created public key & paste it in .env (it will be used as public key reference) 



# AWS CloudFormation

CloudFormation Intro - https://www.youtube.com/watch?v=jhWBn6pPTN4

Resize images on the fly, Watch - https://www.youtube.com/watch?v=uVk-ffHeV7c

Sample CloudFormation Template - https://docs.aws.amazon.com/solutions/latest/serverless-image-handler/aws-cloudformation-template.html

serverless-image-handler.template: – Use this template to launch the solution and all associated components. The default configuration deploys CloudFront, API Gateway, Lambda, and Amazon S3.

Before you launch the solution’s AWS CloudFormation template, you must specify an S3 bucket in the Source Buckets template parameter. Use this S3 bucket to store the images that you want to manipulate. If you have multiple image source S3 buckets, you can specify them as comma-separated values. For lower latency, use an S3 bucket in the same AWS Region where you launch your CloudFormation template.

Supported Thumbor Filters - https://docs.aws.amazon.com/solutions/latest/serverless-image-handler/use-supported-thumbor-filters.html


Bucket Changes required : 
Edit Object Ownership - ACLs Enabled, choose Bucket owner preferred
Edit Block public access (bucket settings) - Uncheck Block all public access


# Get mime type from url of file
file-type   (recommended)
mime-type



# connect strapi with aws
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]




# create IAM user
https://www.geeksforgeeks.org/how-to-create-an-iam-user-in-aws/


















# incrase nginx file upload limit
    sudo nano /etc/nginx/nginx.conf
    
    add below line only
        client_max_body_size 10M;
        
        
        
# increase file upload limit in koa (koa-body)

    // Conditional koa-body middleware
    app.use(async (ctx, next) => {

        if (ctx.path.includes('large')) {
            // Apply koa-body with specific options
            await koaBody({
                formLimit: "10mb", // Modify form body limit
                // jsonLimit: "256mb", // Modify JSON body limit
                // textLimit: "256mb", // Modify text body limit
                formidable: {
                    maxFileSize: 200 * 1024 * 1024, // Limit for uploaded file size
                },
                multipart: true,
                urlencoded: true
            })(ctx, next);

        } else {
            // Apply koa-body with default options
            await koaBody({
                multipart: true,
                urlencoded: true
            })(ctx, next);
        }
    });

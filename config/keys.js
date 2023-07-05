export const AWS_CONFIG = {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

export const AWS_CLOUDFRONT_CONFIG = {
    keyPairId: process.env.AWS_CLOUDFRONT_PUBLIC_KEY_ID,
    privateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY,
};
import { S3Client } from "@aws-sdk/client-s3";

/**
 * Updates the AWS configuration with the access key ID, secret access key, and region from the environment variables.
 * Creates a new S3 instance and exports it as 's3'.
 * Exports the S3 bucket name from the environment variables as 'bucketName'.
 */
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});
export const bucketName = process.env.S3_BUCKET_NAME || "wk-intern-2024";

import { S3Client } from "@aws-sdk/client-s3";

/**
 * Creates a new S3 client instance with the specified configuration.
 * @param {Object} configuration - The configuration object for the S3 client.
 * @param {string} configuration.region - The AWS region for the S3 client.
 * @param {Object} configuration.credentials - The credentials object containing accessKeyId and secretAccessKey.
 * @param {string} configuration.credentials.accessKeyId - The access key ID for AWS authentication.
 * @param {string} configuration.credentials.secretAccessKey - The secret access key for AWS authentication.
 */
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

export default s3;

import multerS3 from "multer-s3";
import s3 from "../../config/aws-s3.config";
import multer from "multer";

/**
 * Middleware function for uploading files to AWS S3 bucket using multer and multerS3.
 * @returns {Function} Express middleware function for handling file uploads to S3.
 */
export const s3Upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME || "default-bucket",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, file.filename);
    },
  }),
});

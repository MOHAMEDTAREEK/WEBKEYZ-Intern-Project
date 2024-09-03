// import multer from "multer";
// import multerS3 from "multer-s3";
// import sharp from "sharp";
// import s3 from "../../config/aws-s3.config";
// import { v4 as uuidv4 } from "uuid";

// const upload = multer({
//   storage: multerS3({
//     s3: s3 , 
//     bucket: process.env.S3_BUCKET_NAME || "default-bucket",
//     acl: "public-read", // Allows public access to the uploaded file
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     key: async (req, file, cb) => {
//       const fileName = `images/${uuidv4()}-${Date.now().toString()}.jpeg`;

//       // Resize the image using Sharp
//       const buffer = await sharp(file.buffer)
//         .resize(800, 800, {
//           fit: sharp.fit.inside,
//           withoutEnlargement: true,
//         })
//         .toFormat("jpeg")
//         .jpeg({ quality: 90 })
//         .toBuffer();

//       cb(null, fileName);
//     },
//   }),
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
// });

// export default upload;

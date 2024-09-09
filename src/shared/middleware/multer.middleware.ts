import multer from "multer";
import { Request } from "express";
import { AllowedTypes } from "../enums/constants/types.enum";
import { ErrorMessage } from "../enums/constants/error-message.enum";

const storage = multer.memoryStorage(); // Store the image in memory temporarily

/**
 * Middleware function to filter uploaded files based on allowed types.
 * @param req - The request object.
 * @param file - The uploaded file object.
 * @param cb - The callback function to execute.
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  const allowedTypes = [
    AllowedTypes.IMAGE_TYPE_jpeg,
    AllowedTypes.IMAGE_TYPE_png,
    AllowedTypes.IMAGE_TYPE_gif,
    AllowedTypes.IMAGE_TYPE_jpg,
  ];
  if (allowedTypes.includes(file.mimetype as AllowedTypes)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error(ErrorMessage.INVALID_IMAGE_FORMAT), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB in bytes
  fileFilter: fileFilter,
});
export const uploadPhotos = upload.array("postPhoto", 2);
export default upload;

import multer from "multer";
import { Request } from "express";
import { BaseError } from "../exceptions/base.error";

const allowedFileTypes = /jpeg|jpg|png/;
const maxFileSize = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

export const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const extname = allowedFileTypes.test(file.mimetype.toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(
      new BaseError(
        "File type not allowed. Only JPEG, JPG, and PNG are permitted.",
        400
      )
    );
  }
};
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize },
});

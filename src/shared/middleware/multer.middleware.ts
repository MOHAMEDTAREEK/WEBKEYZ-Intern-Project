import multer from "multer";
import { Request, Response, NextFunction } from "express";

const storage = multer.memoryStorage(); // Store the image in memory temporarily

/**
 * Middleware function to filter uploaded files based on allowed types.
 * @param req - The request object.
 * @param file - The uploaded file object.
 * @param cb - The callback function to execute.
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."),
      false
    ); // Reject file
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: fileFilter,
});

export default upload;

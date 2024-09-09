import { NextFunction, Request, Response } from "express";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { ErrorMessage } from "../enums/constants/error-message.enum";

/**
 * Middleware function to resize an image uploaded in the request.
 * If no file is uploaded, returns a 400 error response.
 * Resizes the image to 800x800 dimensions, converts it to JPEG format with 90% quality,
 * and saves it in the 'images' directory with a unique filename.
 * @param req - The Express Request object containing the uploaded file.
 * @param res - The Express Response object to send responses.
 * @param next - The Express NextFunction to pass control to the next middleware.
 */
export const resizeImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.files) {
    return res.status(400).json({ error: ErrorMessage.NO_FILE_UPLOADED });
  }
  const files = req.files as Express.Multer.File[];

  try {
    await Promise.all(
      files.map(async (file) => {
        const filename = `images/${uuidv4()}-${Date.now()}.jpeg`;
        file.buffer = await sharp(file.buffer)
          .resize(800, 800, {
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toBuffer();
        file.filename = filename;
      })
    );

    next();
  } catch (err) {
    next(err);
  }
};

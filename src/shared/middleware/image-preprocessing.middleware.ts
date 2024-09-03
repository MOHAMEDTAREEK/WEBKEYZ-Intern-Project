import { NextFunction, Request, Response } from "express";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

export const resizeImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  req.file.filename = `images/${uuidv4()}-${Date.now().toString()}.jpeg`;

  try {
    req.file.buffer = await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer();

    next();
  } catch (err) {
    next(err);
  }
};

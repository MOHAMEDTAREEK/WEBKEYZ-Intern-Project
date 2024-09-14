import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { getOutputFormat } from "./extract-file-format";
/**
 * Process a file for resizing and format conversion.
 *
 * @param file - The file to be processed using Express.Multer.File type.
 * @returns A Promise that resolves once the file processing is complete.
 */
export const processFile = async (file: Express.Multer.File): Promise<void> => {
  const filename = `images/${uuidv4()}-${Date.now()}`;
  const outputFormat = getOutputFormat(file.mimetype);

  let sharpInstance = sharp(file.buffer).resize(800, 800, {
    fit: sharp.fit.inside,
    withoutEnlargement: true,
  });

  if (outputFormat === "gif") {
    sharpInstance = sharpInstance.toFormat("gif");
  } else {
    sharpInstance = sharpInstance.toFormat("jpeg").jpeg({ quality: 90 });
  }

  file.buffer = await sharpInstance.toBuffer();
  file.filename = `${filename}.${outputFormat}`;
};

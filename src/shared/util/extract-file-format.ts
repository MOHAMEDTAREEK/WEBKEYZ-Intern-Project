/**
 * Determines the output format based on the provided mimetype.
 * @param mimetype The mimetype to extract the file extension from.
 * @returns The output format as either "gif" or "jpeg".
 */
export const getOutputFormat = (mimetype: string): "gif" | "jpeg" => {
  const fileExtension = mimetype.split("/")[1];
  return fileExtension === "gif" ? "gif" : "jpeg";
};

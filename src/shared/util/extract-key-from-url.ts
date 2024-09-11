export const extractKeyFromUrl = (url: string) => {
  const cleanUrl = url.split("?")[0];
  const encodedKey = cleanUrl.substring(cleanUrl.indexOf(".com/") + 5);
  const decodedKey = decodeURIComponent(encodedKey);
  return decodedKey;
};

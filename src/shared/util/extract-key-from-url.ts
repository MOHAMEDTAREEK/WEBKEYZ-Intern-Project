/**
 * Extracts a key from the provided URL by decoding the encoded key part after '.com/'.
 *
 * @param url The URL from which to extract the key.
 * @returns The decoded key extracted from the URL.
 */
export const extractKeyFromUrl = (url: string) => {
  const cleanUrl = url.split("?")[0];
  const encodedKey = cleanUrl.substring(cleanUrl.indexOf(".com/") + 5);
  const decodedKey = decodeURIComponent(encodedKey);
  return decodedKey;
};

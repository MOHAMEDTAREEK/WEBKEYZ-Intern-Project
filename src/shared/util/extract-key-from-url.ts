export const extractKeyFromUrl = (url: string) => {
  const cleanUrl = url.split("?")[0];
  const key = cleanUrl.substring(cleanUrl.indexOf(".com/") + 5);

  return key;
};

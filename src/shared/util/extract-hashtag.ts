/**
 * Extracts hashtags from a given description string.
 *
 * @param description The input string to extract hashtags from.
 * @returns An array of extracted hashtags.
 */
export const extractHashtags = (description: string): string[] => {
  const hashtagPattern = /#(\w+)/g;
  const hashtags = [...description.matchAll(hashtagPattern)];
  return hashtags.map((hashtag) => hashtag[1]);
};

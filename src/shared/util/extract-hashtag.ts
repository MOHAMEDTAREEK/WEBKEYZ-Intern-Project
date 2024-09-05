export const extractHashtags = (description: string): string[] => {
  const hashtagPattern = /#(\w+)/g;
  const hashtags = [...description.matchAll(hashtagPattern)];
  return hashtags.map((hashtag) => hashtag[1]);
};

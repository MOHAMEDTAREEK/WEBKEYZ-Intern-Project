export const extractMentions = (description: string): string[] => {
  const mentionPattern = /@([A-Za-z]+(?: [A-Za-z]+)*)/g;
  const mentions = [...description.matchAll(mentionPattern)];
  return mentions.map((mention) => mention[1]);
};


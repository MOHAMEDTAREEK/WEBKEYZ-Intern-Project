/**
 * Extracts mentions from a given description.
 *
 * @param description The input string to extract mentions from.
 * @returns An array of mentions found in the description.
 */
export const extractMentions = (description: string): string[] => {
  const mentionPattern = /@([A-Za-z]+ [A-Za-z]+)/g;
  const mentions = [...description.matchAll(mentionPattern)];
  return mentions.map((mention) => mention[1]);
};

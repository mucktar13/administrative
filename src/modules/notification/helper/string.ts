/**
 * Extracts email addresses from a string in mention format (e.g., @user@email.com).
 * @param text The input string.
 * @returns An array of email addresses.
 */
export const extractEmailsFromMentions = (text: string): string[] => {
  const regex = /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const matches = text.match(regex);
  if (!matches) {
    return [];
  }
  return matches.map((match) => match.slice(1)); // Remove the "@" prefix
};

export const extractTagsFromText = (text = "") => {
  const matches = text.match(/\{\{[^}]+\}\}/g) || [];
  return [...new Set(matches)];
};

export const genUsername = (fName: string): string => {
  const randomChars = Math.random().toString(36).slice(2);
  return fName + '_' + randomChars;
};

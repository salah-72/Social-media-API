export const genPassport = () => {
  const randomChars = Math.random().toString(36).slice(2);
  return randomChars;
};

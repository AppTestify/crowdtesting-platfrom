export const truncateString = (info: string, wordLimit: number ) => {
  const words = info.split(" ");
  return words.length > wordLimit
    ? `${words.slice(0, wordLimit).join(" ")}...`
    : info;
};

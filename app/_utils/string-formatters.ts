export const toTitleCase = (str: string) => {
  if (!str) {
    return "";
  }
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const getAvatarFallbackText = (
  user: {
    name: string;
    email: string;
  } | null
) => {
  if (user?.name.trim()) {
    const initials = user.name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2);
    return initials.toUpperCase() || "AV";
  }
  return user?.email?.slice(0, 2).toUpperCase() || "AV";
};

export const getFormattedBase64ForSrc = (file: any) => {
  if (!file) {
    return "";
  }
  return `data:${file.contentType};base64,${file.data}`;
};

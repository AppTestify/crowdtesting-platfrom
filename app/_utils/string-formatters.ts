import { IUser } from "../_interface/user";

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
  if (user?.name) {
    const initials = user.name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2);
    return initials.toUpperCase() || "AV";
  }
  return user?.email?.slice(0, 2).toUpperCase() || "AV";
};

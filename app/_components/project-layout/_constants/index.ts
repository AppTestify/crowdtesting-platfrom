import { UserRoles } from "@/app/_constants/user-roles";

export const getProjectTabs = (user: any) => {
  switch (user?.role) {
    case UserRoles.ADMIN:
      return ["dashboard","test instruction", "users", "issues", "test cycle", "notes"];
    case UserRoles.TESTER:
      return ["dashboard","test instruction", "issues", "test cycle", "notes"];
    case UserRoles.CLIENT:
      return ["dashboard","test instruction", "users", "issues", "test cycle", "notes"];
    default:
      return ["dashboard","test instruction", "users", "issues", "notes"];
  }
};

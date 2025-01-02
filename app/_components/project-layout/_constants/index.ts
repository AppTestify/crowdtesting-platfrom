import { UserRoles } from "@/app/_constants/user-roles";

export const getProjectTabs = (user: any) => {
  switch (user?.role) {
    case UserRoles.ADMIN:
      return ["dashboard", "users", "issues", "test cycle", "notes"];
    case UserRoles.TESTER:
      return ["dashboard", "issues", "test cycle", "notes"];
    case UserRoles.CLIENT:
      return ["dashboard", "users", "issues", "test cycle", "notes"];
    default:
      return ["dashboard", "users", "issues", "notes"];
  }
};

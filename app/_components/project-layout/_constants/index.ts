import { UserRoles } from "@/app/_constants/user-roles";

export const getProjectTabs = (user: any) => {
  switch (user?.role) {
    case UserRoles.ADMIN:
      return ["test instructions", "users", "issues", "test cycle", "notes"];
    case UserRoles.TESTER:
      return ["test instructions", "issues", "test cycle", "notes"];
    case UserRoles.CLIENT:
      return ["test instructions", "users", "issues", "test cycle", "notes"];
    default:
      return ["test instructions", "users", "issues", "notes"];
  }
};

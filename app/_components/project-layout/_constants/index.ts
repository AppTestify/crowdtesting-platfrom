import { UserRoles } from "@/app/_constants/user-roles";

export const getProjectTabs = (user: any) => {
  switch (user?.role) {
    case UserRoles.ADMIN:
      return [
        "dashboard",
        "test instructions",
        "users",
        "issues",
        "tasks",
        "test cycle",
        "reports",
      ];
    case UserRoles.TESTER:
      return [
        "dashboard",
        "test instructions",
        "issues",
        "tasks",
        "test cycle",
        "reports",
      ];
    case UserRoles.CLIENT:
      return [
        "dashboard",
        "test instructions",
        "users",
        "issues",
        "tasks",
        "test cycle",
        "reports",
      ];
    default:
      return [
        "dashboard",
        "test instructions",
        "users",
        "issues",
        "tasks",
        "reports",
      ];
  }
};

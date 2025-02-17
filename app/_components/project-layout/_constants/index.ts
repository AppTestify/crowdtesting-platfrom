import { UserRoles } from "@/app/_constants/user-roles";

export const getProjectTabs = (user: any) => {
  switch (user?.role) {
    case UserRoles.ADMIN:
      return [
        "dashboard",
        "project details",
        "users",
        "requirements",
        "test plans",
        "test suites",
        "test cases",
        "test executions",
        "issues",
        "tasks",
        "test cycle",
        "reports",
        "RTM",
      ];
    case UserRoles.TESTER:
      return [
        "dashboard",
        "project details",
        "requirements",
        "test plans",
        "test suites",
        "test cases",
        "test executions",
        "issues",
        "tasks",
        "test cycle",
        "reports",
      ];
    case UserRoles.CLIENT:
      return [
        "dashboard",
        "project details",
        "users",
        "requirements",
        "test plans",
        "test suites",
        "test cases",
        "test executions",
        "issues",
        "tasks",
        "test cycle",
        "reports",
        "RTM",
      ];
    default:
      return [
        "dashboard",
        "project details",
        "users",
        "requirements",
        "test plans",
        "test suites",
        "test cases",
        "issues",
        "tasks",
        "reports",
      ];
  }
};

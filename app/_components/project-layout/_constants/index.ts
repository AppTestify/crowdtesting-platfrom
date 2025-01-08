import { UserRoles } from "@/app/_constants/user-roles";

export const getProjectTabs = (user: any) => {
  switch (user?.role) {
      case UserRoles.ADMIN:
          return ["dashboard","test instructions", "users", "requirements", "test plans", "test suites", "test cases",
              "test cycle", "test execution", "issues", "notes"];
      case UserRoles.TESTER:
          return ["dashboard","test instructions", "requirements", "test plans", "test suites", "test cases", "test cycle",
              "test execution", "issues", "notes"];
      case UserRoles.CLIENT:
          return ["dashboard","test instructions", "requirements", "test plans", "test suites", "test cases", "test cycle",
              "test execution", "issues", "notes"];
      default:
          return ["overview"];
  }
}
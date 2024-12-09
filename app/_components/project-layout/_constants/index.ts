import { UserRoles } from "@/app/_constants/user-roles";

export const getProjectTabs = (user: any) => {
    switch (user?.role) {
        case UserRoles.ADMIN:
            return ["overview", "users", "requirements", "test plans", "test suites", "test cases",
                "test cycle", "test execution", "issues", "RTM", "notes"];
        case UserRoles.TESTER:
            return ["overview", "requirements", "test plans", "test suites", "test cases", "test cycle",
                "test execution", "issues", "RTM", "notes"];
        default:
            return ["overview"];
    }
}
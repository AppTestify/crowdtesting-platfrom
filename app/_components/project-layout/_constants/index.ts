import { UserRoles } from "@/app/_constants/user-roles";

export const getProjectTabs = (user: any) => {
    switch (user?.role) {
        case UserRoles.ADMIN:
            return ["overview", "users", "requirements", "test plans", "test suites", "test cases",
                "test cycle", "issues"];
        case UserRoles.TESTER:
            return ["overview", "requirements", "test plans", "test suites", "test cases", "test cycle",
                "issues"];
        default:
            return ["overview"];
    }

}
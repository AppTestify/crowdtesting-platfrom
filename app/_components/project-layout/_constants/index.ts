import { UserRoles } from "@/app/_constants/user-roles";

export const getProjectTabs = (user: any) => {
    switch (user?.role) {
        case UserRoles.ADMIN:
            return ["overview", "users", "issues", "requirements", "test suites"];
        case UserRoles.TESTER:
            return ["overview", "issues", "requirements", "test suites"];
        default:
            return ["overview"];
    }

}
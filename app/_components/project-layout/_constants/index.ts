import { UserRoles } from "@/app/_constants/user-roles";

export const getProjectTabs = (user: any) => {
    switch (user?.role) {
        case UserRoles.ADMIN:
            return ["overview", "users", "issues", "requirements"];
        case UserRoles.TESTER:
            return ["overview", "issues", "requirements"];
        default:
            return ["overview"];
    }

}
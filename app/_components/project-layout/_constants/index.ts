import { UserRoles } from "@/app/_constants/user-roles";

export const getProjectTabs = (user: any) => {
    switch (user?.role) {
        case UserRoles.ADMIN:
            return ["overview", "users", "issues", "notes"];
        case UserRoles.TESTER:
            return ["overview", "issues", "notes"];
        case UserRoles.CLIENT:
            return ["overview", "users", "issues", "notes"];
        default:
            return ["overview", "users", "issues", "notes"];
    }
}
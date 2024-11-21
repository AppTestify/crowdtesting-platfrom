import { ChevronDown, ChevronUp, Equal } from "lucide-react";
import { IssueStatus, Priority } from "../_constants/issue";
import { Badge } from "@/components/ui/badge";
import { UserRoles } from "../_constants/user-roles";
import { ProjectUserRoles } from "../_constants/project-user-roles";

export const displayIcon = (priority: string) => {
    switch (priority) {
        case Priority.LOW:
            return <ChevronDown className="text-primary w-6" />;
        case Priority.NORMAL:
            return <Equal className="text-yellow-400 w-6" />;
        case Priority.HIGH:
            return <ChevronUp className="text-red-400 w-6" />;
        default:
            return null;
    }
};

export const statusBadge = (status: string | undefined) => {
    switch (status) {
        case IssueStatus.NEW:
            return <Badge className="bg-gray-400 hover:bg-gray-400 font-medium">{IssueStatus?.NEW}</Badge>;
        case IssueStatus.FIXED:
            return <Badge className="bg-primary hover:bg-primary font-medium">{IssueStatus?.FIXED}</Badge>;
        case IssueStatus.DUPLICATE:
            return <Badge className="bg-blue-400 hover:bg-blue-400 font-medium">{IssueStatus?.DUPLICATE}</Badge>;
        case IssueStatus.INVALID:
            return <Badge className="bg-red-400 hover:bg-red-400 font-medium">{IssueStatus?.INVALID}</Badge>;
        case IssueStatus.DEFERRED:
            return <Badge className="bg-yellow-400 hover:bg-yellow-400 font-medium">{IssueStatus?.DEFERRED}</Badge>;
        case IssueStatus.RETEST_FAILED:
            return <Badge className="bg-red-400 hover:bg-red-400 font-medium text-center">{IssueStatus?.RETEST_FAILED}</Badge>;
        case IssueStatus.RETEST_PASSED:
            return <Badge className="bg-primary hover:bg-primary font-medium text-center">{IssueStatus?.RETEST_PASSED}</Badge>;
        default:
            return null;
    }
}

export const showUsersRoleInBadges = (role: UserRoles) => {
    switch (role) {
        case UserRoles.ADMIN:
            return <Badge className="bg-red-400 hover:bg-red-400 font-medium">{UserRoles.ADMIN}</Badge>;
        case UserRoles.CLIENT:
            return <Badge className="bg-primary hover:bg-primary font-medium">{UserRoles.CLIENT}</Badge>;
        case UserRoles.TESTER:
            return <Badge className="bg-blue-400 hover:bg-blue-400 font-medium">{UserRoles.TESTER}</Badge>;
        default:
            return null;
    }
}

export const statusBadgeProjectUserRole = (role: string) => {
    switch (role) {
        case ProjectUserRoles.ADMIN:
            return <Badge className="bg-red-400 hover:bg-red-400 font-medium">{ProjectUserRoles.ADMIN}</Badge>;
        case ProjectUserRoles.CLIENT:
            return <Badge className="bg-primary hover:bg-primary font-medium">{ProjectUserRoles.CLIENT}</Badge>;
        case ProjectUserRoles.TESTER:
            return <Badge className="bg-blue-400 hover:bg-blue-400 font-medium">{ProjectUserRoles.TESTER}</Badge>;
        case ProjectUserRoles.MANAGER:
            return <Badge className="bg-orange-400 hover:bg-orange-400 font-medium">{ProjectUserRoles.MANAGER}</Badge>;
        case ProjectUserRoles.DEVELOPER:
            return <Badge className="bg-purple-400 hover:bg-purple-400 font-medium">{ProjectUserRoles.DEVELOPER}</Badge>;
        default:
            return null;
    }
}
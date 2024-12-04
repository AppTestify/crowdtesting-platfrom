import { ChevronDown, ChevronUp, Equal } from "lucide-react";
import { IssueStatus, Priority } from "../_constants/issue";
import { Badge } from "@/components/ui/badge";
import { UserRoles } from "../_constants/user-roles";

export const displayIcon = (priority: string) => {
    switch (priority) {
        case Priority.LOW:
            return <ChevronDown className="text-green-400 w-6" />;
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
            return <Badge className="bg-gray-400 hover:bg-gray-400">New</Badge>;
        case IssueStatus.FIXED:
            return <Badge className="bg-green-400 hover:bg-green-400">Fixed</Badge>;
        case IssueStatus.DUPLICATE:
            return <Badge className="bg-blue-400 hover:bg-blue-400">Duplicate</Badge>;
        case IssueStatus.INVALID:
            return <Badge className="bg-red-400 hover:bg-red-400">Invalid</Badge>;
        case IssueStatus.DEFERRED:
            return <Badge className="bg-yellow-400 hover:bg-yellow-400">Deferred</Badge>;
        default:
            return null;
    }
}

export const showUsersRoleInBadges = (role: UserRoles) => {
    switch (role) {
        case UserRoles.ADMIN:
            return <Badge className="bg-red-400 hover:bg-red-400">{UserRoles.ADMIN}</Badge>;
        case UserRoles.CLIENT:
            return <Badge className="bg-green-400 hover:bg-green-400">{UserRoles.CLIENT}</Badge>;
        case UserRoles.TESTER:
            return <Badge className="bg-blue-400 hover:bg-blue-400">{UserRoles.TESTER}</Badge>;
        default:
            return null;
    }
}
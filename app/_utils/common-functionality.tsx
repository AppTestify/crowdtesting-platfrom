import { ChevronDown, ChevronUp, Equal, FileSpreadsheet, Loader2 } from "lucide-react";
import { IssueStatus, Priority, TaskStatus } from "../_constants/issue";
import { Badge } from "@/components/ui/badge";
import { UserRoles } from "../_constants/user-roles";
import { ProjectUserRoles } from "../_constants/project-user-roles";
import { TestCaseExecutionResult } from "../_constants/test-case";
import { Button } from "@/components/ui/button";
import { PaymentStatus } from "../_constants/payment";

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
            return <Badge className="bg-gray-400 hover:bg-gray-400 font-medium">{IssueStatus.NEW}</Badge>;
        case IssueStatus.OPEN:
            return <Badge className="bg-blue-500 hover:bg-blue-500 font-medium">{IssueStatus.OPEN}</Badge>;
        case IssueStatus.ASSIGNED:
            return <Badge className="bg-indigo-500 hover:bg-indigo-500 font-medium">{IssueStatus.ASSIGNED}</Badge>;
        case IssueStatus.IN_PROGRESS:
            return <Badge className="bg-yellow-500 hover:bg-yellow-500 font-medium">{IssueStatus.IN_PROGRESS}</Badge>;
        case IssueStatus.FIXED:
            return <Badge className="bg-green-500 hover:bg-green-500 font-medium">{IssueStatus.FIXED}</Badge>;
        case IssueStatus.READY_FOR_RETEST:
            return <Badge className="bg-teal-400 hover:bg-teal-400 font-medium">{IssueStatus.READY_FOR_RETEST}</Badge>;
        case IssueStatus.RETESTING:
            return <Badge className="bg-orange-400 hover:bg-orange-400 font-medium">{IssueStatus.RETESTING}</Badge>;
        case IssueStatus.VERIFIED:
            return <Badge className="bg-green-700 hover:bg-green-700 font-medium">{IssueStatus.VERIFIED}</Badge>;
        case IssueStatus.CLOSED:
            return <Badge className="bg-purple-500 hover:bg-purple-500 font-medium">{IssueStatus.CLOSED}</Badge>;
        case IssueStatus.REOPENED:
            return <Badge className="bg-pink-500 hover:bg-pink-500 font-medium">{IssueStatus.REOPENED}</Badge>;
        case IssueStatus.DEFERRED:
            return <Badge className="bg-yellow-400 hover:bg-yellow-400 font-medium">{IssueStatus.DEFERRED}</Badge>;
        case IssueStatus.DUPLICATE:
            return <Badge className="bg-blue-400 hover:bg-blue-400 font-medium">{IssueStatus.DUPLICATE}</Badge>;
        case IssueStatus.REJECTED:
            return <Badge className="bg-red-400 hover:bg-red-400 font-medium">{IssueStatus.REJECTED}</Badge>;
        case IssueStatus.CANNOT_REPRODUCE:
            return <Badge className="bg-gray-600 hover:bg-gray-600 font-medium">{IssueStatus.CANNOT_REPRODUCE}</Badge>;
        case IssueStatus.NOT_A_BUG:
            return <Badge className="bg-gray-500 hover:bg-gray-500 font-medium">{IssueStatus.NOT_A_BUG}</Badge>;
        case IssueStatus.BLOCKED:
            return <Badge className="bg-red-700 hover:bg-red-700 font-medium">{IssueStatus.BLOCKED}</Badge>;
        default:
            return null;
    }
};

export const taskStatusBadge = (status: string | undefined) => {
    switch (status) {
        case TaskStatus.TODO:
            return <Badge className="bg-gray-400 hover:bg-gray-400 font-medium">{TaskStatus.TODO}</Badge>;
        case TaskStatus.IN_PROGRESS:
            return <Badge className="bg-yellow-500 hover:bg-yellow-500 font-medium">{TaskStatus.IN_PROGRESS}</Badge>;
        case TaskStatus.BLOCKED:
            return <Badge className="bg-destructive hover:bg-destructive font-medium">{TaskStatus.BLOCKED}</Badge>;
        case TaskStatus.DONE:
            return <Badge className="bg-primary hover:bg-primary font-medium">{TaskStatus.DONE}</Badge>;
        default:
            return null;
    }
};

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

export const showUsersVerifiedInBadges = (role: boolean) => {
    switch (role) {
        case true:
            return <Badge className="bg-primary hover:bg-primary font-medium">Verified</Badge>;
        case false:
            return <Badge className="bg-yellow-500 hover:bg-yellow-500 font-medium">Unverified</Badge>;
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

export const showTestCaseResultStatusBadge = (role: string) => {
    switch (role) {
        case TestCaseExecutionResult.FAILED:
            return <Badge className="bg-red-400 hover:bg-red-400 font-medium">
                {TestCaseExecutionResult.FAILED}
            </Badge>;
        case TestCaseExecutionResult.PASSED:
            return <Badge className="bg-primary hover:bg-primary font-medium">
                {TestCaseExecutionResult.PASSED}
            </Badge>;
        case TestCaseExecutionResult.BLOCKED:
            return <Badge className="bg-gray-500 hover:bg-gray-500 font-medium">
                {TestCaseExecutionResult.BLOCKED}
            </Badge>;
        case TestCaseExecutionResult.CAUTION:
            return <Badge className="bg-yellow-500 hover:bg-yellow-500 font-medium">
                {TestCaseExecutionResult.CAUTION}
            </Badge>;
        default:
            return null;
    }
}

export const ExportExcelFile = (excel: () => void, hasData: boolean, isLoading: boolean) => {
    return (
        <Button
            type={"button"}
            variant={"outline"}
            disabled={!hasData || isLoading}
            onClick={excel}
        >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet />}
            Export
        </Button>
    )
}
export const paymentStatusBadge = (status: string | undefined) => {
    switch (status) {
        case PaymentStatus.COMPLETED:
            return <Badge className="bg-primary hover:bg-primary font-medium">{PaymentStatus?.COMPLETED}</Badge>;
        case PaymentStatus.FAILED:
            return <Badge className="bg-red-700 hover:bg-red-700 font-medium">{PaymentStatus?.FAILED}</Badge>;
        case PaymentStatus.CANCELLED:
            return <Badge className="bg-yellow-400 hover:bg-yellow-400 font-medium">{PaymentStatus?.CANCELLED}</Badge>;
        case PaymentStatus.REFUNDED:
            return <Badge className="bg-blue-400 hover:bg-blue-400 font-medium">{PaymentStatus?.REFUNDED}</Badge>;
        case PaymentStatus.PROCESSING:
            return <Badge className="bg-gray-400 hover:bg-gray-400 font-medium">{PaymentStatus?.PROCESSING}</Badge>;
        case PaymentStatus.DECLINED:
            return <Badge className="bg-red-400 hover:bg-red-400 font-medium text-center">{PaymentStatus?.DECLINED}</Badge>;
        case PaymentStatus.PENDING:
            return <Badge className="bg-orange-400 hover:bg-orange-400 font-medium text-center">{PaymentStatus?.PENDING}</Badge>;
        default:
            return null;
    }
} 

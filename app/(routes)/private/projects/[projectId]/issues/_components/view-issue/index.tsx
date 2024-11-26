import { IIssue } from "@/app/_interface/issue";
import { getIssueService } from "@/app/_services/issue.service";
import toasterService from "@/app/_services/toaster-service";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import IssueAttachments from "../attachments/issue-attachment";
import { displayIcon, statusBadge } from "@/app/_utils/common-functionality";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { formatDate } from "@/app/_constants/date-formatter";

const ViewIssue = ({
    issue,
    sheetOpen,
    setSheetOpen,
}: {
    issue: IIssue;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [issueData, setIssueData] = useState<IIssue>();
    const issueId = issue?.id;
    const { projectId } = useParams<{ projectId: string }>();

    const getAttachments = async () => {
        try {
            setIsViewLoading(true);
            const response = await getIssueService(projectId, issueId);
            setIssueData(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
    }

    useEffect(() => {
        if (sheetOpen) {
            getAttachments();
        }
    }, [sheetOpen, projectId]);
    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px]">
                {isViewLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <p className="text-gray-500">Loading</p>
                    </div>
                ) :
                    <>
                        <SheetHeader className="mb-4">
                            <div className="flex justify-between items-center mt-6">
                                <p className="text-md capitalize">
                                    <span className="mr-2">
                                        {issue?.customId}:
                                    </span>
                                    {issue?.title}
                                    <p className="text-sm mt-1 text-primary">
                                        Created by {issue?.userId?.firstName} {issue?.userId?.lastName} on {formatDate(issue?.createdAt || "")}
                                    </p>
                                </p>
                            </div>
                        </SheetHeader>
                        <DropdownMenuSeparator className="border-b" />
                        <div className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-4 text-sm ">
                                {/* Severity */}
                                <div className="flex items-center">
                                    <span className=" font-medium">Severity:</span>
                                    <span className="ml-2">{issue?.severity}</span>
                                </div>

                                {/* Priority */}
                                <div className="flex items-center">
                                    <span className=" font-medium">Priority:</span>
                                    <span className="ml-2 flex items-center">
                                        {displayIcon(issue?.priority)}
                                        <span className="ml-1 font-medium">{issue?.priority}</span>
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="flex items-center">
                                    <span className=" font-medium">Status:</span>
                                    <span className="ml-2">{statusBadge(issue?.status)}</span>
                                </div>


                                {/* Device */}
                                <div className="flex items-center">
                                    <span className=" font-medium">Device:</span>
                                    <span className="ml-2">{issue?.device?.[0]?.name}</span>
                                </div>
                            </div>

                            <div >
                                <span className="font-medium">Description</span>
                                <div
                                    className="px-2 text-sm leading-relaxed text-gray-700"
                                    dangerouslySetInnerHTML={{
                                        __html: issueData?.description || '',
                                    }}
                                />
                            </div>
                        </div>

                        <IssueAttachments issueId={issueId} isUpdate={true} isView={true} />
                    </>}
            </SheetContent>
        </Sheet>
    )
}

export default ViewIssue;

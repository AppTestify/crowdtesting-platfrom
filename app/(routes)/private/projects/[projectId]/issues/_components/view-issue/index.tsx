import { IIssue } from "@/app/_interface/issue";
import { getIssueService } from "@/app/_services/issue.service";
import toasterService from "@/app/_services/toaster-service";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import IssueAttachments from "../attachments/issue-attachment";
import { displayIcon, statusBadge } from "@/app/_utils/common-functionality";


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
                <SheetHeader>
                    <div className="flex">
                        <SheetTitle className="text-left">{issueData?.title}</SheetTitle>
                        <div className="ml-6 flex items-center">
                            <span className="mr-1">{displayIcon(issue?.priority)}</span>
                            {issue?.priority}
                        </div>
                    </div>
                </SheetHeader>

                <Tabs defaultValue="summary" className="w-full my-3">
                    <TabsList className="grid w-fit grid-cols-2">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="attachments">Attachments</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary">
                        <div>
                            <div className="flex mt-4">
                                <p>Severity: {issue?.severity}</p>
                                <p className="ml-8">Status: {statusBadge(issue?.status)}</p>
                            </div>
                            <div className="mt-4"
                                dangerouslySetInnerHTML={{
                                    __html: issueData?.description || '',
                                }}
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="attachments">
                        <IssueAttachments issueId={issueId} isUpdate={true} isView={true} />
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}

export default ViewIssue;

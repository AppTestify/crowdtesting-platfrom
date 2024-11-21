import { IRequirement } from "@/app/_interface/requirement";
import toasterService from "@/app/_services/toaster-service";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RequirementAttachments from "../attachments/requirement-attachment";
import { getRequirementService } from "@/app/_services/requirement.service";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

const ViewRequirement = ({
    requirement,
    sheetOpen,
    setSheetOpen,
}: {
    requirement: IRequirement;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [issueData, setIssueData] = useState<IRequirement>();
    const requirementId = requirement?.id;
    const { projectId } = useParams<{ projectId: string }>();

    const getAttachments = async () => {
        try {
            setIsViewLoading(true);
            const response = await getRequirementService(projectId, requirementId);
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
                {issueData ?
                    <>
                        <SheetHeader className="mb-4">
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-md capitalize">{issueData?.title}</p>
                            </div>
                        </SheetHeader>
                        <DropdownMenuSeparator className="border-b" />
                        <div className="mt-4">
                            <span className="">Description</span>
                            <div className="px-2 text-sm leading-relaxed text-gray-700"
                                dangerouslySetInnerHTML={{
                                    __html: issueData?.description || ''
                                }}
                            />
                        </div>
                        {!isViewLoading ?
                            <RequirementAttachments requirementId={requirementId} isUpdate={true} isView={true} />
                            : null
                        }
                    </> : <p className="text-center h-20">Loading</p>
                }
            </SheetContent>
        </Sheet>
    )
}

export default ViewRequirement;

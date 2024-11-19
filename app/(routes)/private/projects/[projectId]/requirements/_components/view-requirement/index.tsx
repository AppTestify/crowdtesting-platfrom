import { IRequirement } from "@/app/_interface/requirement";
import toasterService from "@/app/_services/toaster-service";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RequirementAttachments from "../attachments/requirement-attachment";
import { getRequirementService } from "@/app/_services/requirement.service";

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
                <SheetHeader>
                    <div className="flex">
                        <SheetTitle className="text-left">{issueData?.title}</SheetTitle>
                    </div>
                </SheetHeader>
                <div>
                    <div className="mt-2 text-sm leading-relaxed text-gray-700"
                        dangerouslySetInnerHTML={{
                            __html: issueData?.description || ''
                        }}
                    />
                </div>
                <RequirementAttachments requirementId={requirementId} isUpdate={true} isView={true} />
            </SheetContent>
        </Sheet>
    )
}

export default ViewRequirement;

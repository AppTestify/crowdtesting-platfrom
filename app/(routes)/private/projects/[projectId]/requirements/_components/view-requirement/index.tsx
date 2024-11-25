import { IRequirement } from "@/app/_interface/requirement";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet"
import RequirementAttachments from "../attachments/requirement-attachment";
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
    const requirementId = requirement?.id;

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px]">
                {requirement ?
                    <>
                        <SheetHeader className="mb-4">
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-md capitalize">
                                    <span className="mr-2">
                                        {requirement?.customId}:
                                    </span>{requirement?.title}</p>
                            </div>
                        </SheetHeader>
                        <DropdownMenuSeparator className="border-b" />
                        <div className="mt-4">
                            <span className="">Description</span>
                            <div className="px-2 text-sm leading-relaxed text-gray-700"
                                dangerouslySetInnerHTML={{
                                    __html: requirement?.description || ''
                                }}
                            />
                        </div>
                        <RequirementAttachments requirementId={requirementId} isUpdate={true} isView={true} />
                    </> : <p className="text-center mt-24">Loading</p>
                }
            </SheetContent>
        </Sheet>
    )
}

export default ViewRequirement;

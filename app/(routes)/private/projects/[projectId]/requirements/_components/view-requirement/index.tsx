import { IRequirement } from "@/app/_interface/requirement";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import RequirementAttachments from "../attachments/requirement-attachment";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RequirementTabs } from "@/app/_constants/project";
import { formatDistanceToNow } from "date-fns";

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
      <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
        {requirement ? (
          <>
            <SheetHeader className="mb-4">
              <div className="flex justify-between items-center mt-4">
                <p className="text-xl font-medium capitalize">
                  <span className="mr-2 text-primary">
                    {requirement?.customId}:
                  </span>
                  {requirement?.title}
                </p>
              </div>
              <span className="text-mute text-sm">
                {requirement?.userId?.firstName ? (
                  <span>
                    Created by {requirement?.userId?.firstName}{" "}
                    {requirement?.userId?.lastName}
                    {", "}
                  </span>
                ) : null}
                Last updated at{" "}
                {requirement.updatedAt && formatDistanceToNow(new Date(requirement.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </SheetHeader>

            <Tabs
              defaultValue={RequirementTabs.DESCRIPTION}
              className="w-full mt-4"
            >
              <TabsList className="grid grid-cols-2 mb-4 w-full md:w-fit">
                <TabsTrigger
                  value={RequirementTabs.DESCRIPTION}
                  className="flex items-center"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value={RequirementTabs.ATTACHMENTS}
                  className="flex items-center"
                >
                  Attachments
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value={RequirementTabs.DESCRIPTION}
                className="w-full"
              >
                <div className="mt-4">
                  <div
                    className="text-sm leading-relaxed text-gray-700 rich-description"
                    dangerouslySetInnerHTML={{
                      __html: requirement?.description || "",
                    }}
                  />
                </div>
              </TabsContent>
              <TabsContent
                value={RequirementTabs.ATTACHMENTS}
                className="w-full"
              >
                <RequirementAttachments
                  requirementId={requirementId}
                  isUpdate={true}
                  isView={true}
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <p className="text-center mt-24">Loading</p>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ViewRequirement;

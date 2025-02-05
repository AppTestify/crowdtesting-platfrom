import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ITestPlan } from "@/app/_interface/test-plan";
import { formatDate } from "@/app/_constants/date-formatter";
import { Separator } from "@/components/ui/separator";
import DefaultComments from "../../../comments";
import { DBModels } from "@/app/_constants";

const ViewTestPlan = ({
  testPlan,
  sheetOpen,
  setSheetOpen,
}: {
  testPlan: ITestPlan;
  sheetOpen: boolean;
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex justify-between items-center mt-4">
            <p className="text-xl font-medium capitalize">
              <span className="mr-2 text-primary">{testPlan?.customId}:</span>
              {testPlan?.title}
            </p>
          </div>
          <span className="text-mute text-sm">
            {testPlan?.userId?.firstName ? (
              <span>
                Created by {testPlan?.userId?.firstName}{" "}
                {testPlan?.userId?.lastName}{", "}
              </span>
            ) : null}
            Created on {formatDate(testPlan?.createdAt || "")}
          </span>
        </SheetHeader>
        <DropdownMenuSeparator className="border-b" />
        <div className="mt-2">
          <span className="text-xl mb-2">Parameters</span>
          <div className="space-y-2 py-2">
            {testPlan?.parameters?.map((parameter, index) => (
              <div key={index} className="flex space-x-3">
                <div className="w-full border rounded-md p-3">
                  <p className="text-lg font-semibold text-gray-800">
                    {parameter?.parameter}
                  </p>
                  <DropdownMenuSeparator className="border-b my-2" />
                  <div
                    className="text-sm leading-relaxed text-gray-700 rich-description"
                    dangerouslySetInnerHTML={{
                      __html: parameter?.description || "",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <Separator />
          <DefaultComments project={testPlan?.projectId} entityId={testPlan?.id} entityName={DBModels.TEST_PLAN} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ViewTestPlan;

import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet"
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ITestPlan } from "@/app/_interface/test-plan";
import { formatDate } from "@/app/_constants/date-formatter";

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
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px]">
                <SheetHeader className="mb-4">
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-md capitalize">
                            <span className="mr-2">
                                {testPlan?.customId}:
                            </span>
                            {testPlan?.title}
                            <p className="text-sm mt-1 text-gray-700">
                                Created by {testPlan?.userId?.firstName} {testPlan?.userId?.lastName} on {formatDate(testPlan?.createdAt || "")}
                            </p>
                        </p>
                    </div>
                </SheetHeader>
                <DropdownMenuSeparator className="border-b" />
                <div className="mt-2">
                    Parameters
                    <div className="space-y-2 py-2">
                        {testPlan?.parameters?.map((parameter, index) => (
                            <div
                                key={index}
                                className="flex space-x-3 px-2 "
                            >
                                <div className="">{index + 1}.</div>
                                <div>
                                    <p className="text-md font-medium text-gray-800">
                                        {parameter?.parameter} -
                                    </p>
                                    <p className=" text-gray-600">
                                        {parameter?.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default ViewTestPlan;

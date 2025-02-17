import { formatDate } from '@/app/_constants/date-formatter';
import { ITestExecution } from '@/app/_interface/test-execution';
import { displayDate } from '@/app/_utils/common-functionality';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import React from 'react'

export default function TestExecutionView({ sheetOpen, setSheetOpen, testExecution }:
    {
        sheetOpen: boolean;
        setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
        testExecution: ITestExecution;
    }
) {
    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader className="mb-4">
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-xl font-medium capitalize">
                            <span className="mr-2 text-primary">{testExecution?.customId}:</span>
                            {testExecution?.testCycle?.title}
                        </p>
                    </div>
                    <span className="text-mute text-sm">
                        {testExecution?.userId?.firstName ? (
                            <span>
                                Created by {testExecution?.userId?.firstName}{" "}
                                {testExecution?.userId?.lastName}{", "}
                            </span>
                        ) : null}
                        Created on {formatDate(testExecution?.createdAt || "")}
                    </span>
                </SheetHeader>
                <DropdownMenuSeparator className="border-b" />
                <div className='flex justify-between'>
                    <div className="mt-2">
                        <span className="text-[20px]">Title</span>
                        <div className="text-sm">
                            {testExecution?.testCycle?.title}
                        </div>
                    </div>
                    <div className='mt-2'>
                        {displayDate(testExecution)}
                    </div>
                </div>
                <div className="mt-3 ">
                    <span className="text-[20px]">Type</span>
                    <div className=" flex items-center ">
                        {testExecution?.type}
                    </div>
                </div>
                <div className="mt-3">
                    <span className="text-[20px]">Description</span>
                    <div className="text-sm">
                        {testExecution?.testCycle?.description}
                    </div>
                </div>

            </SheetContent>
        </Sheet>
    )
}

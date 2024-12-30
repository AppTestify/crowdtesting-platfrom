import { formatDate, formatDateWithoutTime } from '@/app/_constants/date-formatter';
import { ITestCycle } from '@/app/_interface/test-cycle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import React from 'react'

export default function TestCycleView({ sheetOpen, setSheetOpen, testCycle }:
    {
        sheetOpen: boolean;
        setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
        testCycle: ITestCycle;
    }
) {
    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader className="mb-4">
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-xl font-medium capitalize">
                            <span className="mr-2 text-primary">{testCycle?.customId}:</span>
                            {testCycle?.title}
                        </p>
                    </div>
                    <span className="text-mute text-sm">
                        {testCycle?.userId?.firstName ? (
                            <span>
                                Created by {testCycle?.userId?.firstName}{" "}
                                {testCycle?.userId?.lastName}{", "}
                            </span>
                        ) : null}
                        Created on {formatDate(testCycle?.createdAt || "")}
                    </span>
                </SheetHeader>
                <DropdownMenuSeparator className="border-b" />
                <div className='flex justify-between'>
                    <div className="mt-2">
                        <span className="text-[20px]">Title</span>
                        <div className="text-sm">
                            {testCycle?.title}
                        </div>
                    </div>
                    <div className='mt-2'>
                        <TooltipProvider>
                            <Tooltip delayDuration={50}>
                                <TooltipTrigger asChild>
                                    <div>
                                        <Badge variant={'outline'} className='font-medium'>
                                            {formatDateWithoutTime(testCycle?.startDate)} - {formatDateWithoutTime(testCycle?.endDate)}
                                        </Badge>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Start date - End date</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                    </div>
                </div>
                <div className="mt-3">
                    <span className="text-[20px]">Description</span>
                    <div className="text-sm">
                        {testCycle?.description}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

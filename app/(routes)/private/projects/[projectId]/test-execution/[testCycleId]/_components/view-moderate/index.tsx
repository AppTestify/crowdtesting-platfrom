import { ITestCaseResult } from '@/app/_interface/test-case-result';
import { Sheet, SheetContent } from '@/components/ui/sheet'
import React from 'react'
import TestStep from '../../_section/test-step';
import TestData from '../../_section/test-data';
import { showTestCaseResultStatusBadge } from '@/app/_utils/common-functionality';

export default function ModerateView({ sheetOpen, setSheetOpen, moderate }:
    {
        sheetOpen: boolean;
        setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
        moderate: ITestCaseResult;
    }
) {
    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <TestStep testCaseResult={moderate} />
                <TestData testCaseResult={moderate} />
                <div className='mt-5'>
                    <div className='text-lg font-semibold'>
                        Expected result
                    </div>
                    <div
                        className="text-sm leading-relaxed text-gray-700 space-y-2 rich-description"
                        dangerouslySetInnerHTML={{
                            __html: moderate?.testCaseId?.expectedResult || "",
                        }}
                    />
                </div>
                {moderate?.actualResult &&
                    <div className='mt-5'>
                        <div className='text-lg font-semibold'>
                            Actual result
                        </div>
                        <div className=" leading-relaxed text-gray-700 space-y-2 rich-description">
                            {moderate?.actualResult}
                        </div>
                    </div>
                }
                {moderate?.remarks &&
                    <div className='mt-5'>
                        <div className='text-lg font-semibold'>
                            Remarks
                        </div>
                        <div className="leading-relaxed text-gray-700 space-y-2 rich-description">
                            {moderate?.remarks}
                        </div>
                    </div>
                }
                {moderate?.result &&
                    <div className='mt-5'>
                        <div className=''>
                            <span className='text-lg font-semibold'>Result:</span>
                            <span className='leading-relaxed text-gray-700 space-y-2 rich-description ml-4'>
                                {showTestCaseResultStatusBadge(moderate?.result as string)}
                            </span>
                        </div>
                    </div>
                }
            </SheetContent>
        </Sheet>
    )
}

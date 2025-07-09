import { formatDate } from '@/app/_constants/date-formatter';
import { ITestExecution } from '@/app/_interface/test-execution';
import { displayDate } from '@/app/_utils/common-functionality';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import React from 'react'

export default function TestExecutionView({ sheetOpen, setSheetOpen, testExecution }:
    {
        sheetOpen: boolean;
        setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
        testExecution: ITestExecution;
    }
) {
    return (
        <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
            <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold">View Test Execution</h2>
                            <p className="text-sm text-muted-foreground">
                                Test execution details and information
                            </p>
                        </div>
                    </div>
                </DialogHeader>
                <DropdownMenuSeparator className="border-b" />
                
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <div>
                            <span className="text-lg font-medium">Title</span>
                            <div className="text-sm text-gray-600">
                                {testExecution?.testCycle?.title}
                            </div>
                        </div>
                        <div>
                            {displayDate(testExecution)}
                        </div>
                    </div>
                    
                    <div>
                        <span className="text-lg font-medium">Type</span>
                        <div className="text-sm text-gray-600">
                            {testExecution?.type}
                        </div>
                    </div>
                    
                    <div>
                        <span className="text-lg font-medium">Description</span>
                        <div className="text-sm text-gray-600">
                            {testExecution?.testCycle?.description}
                        </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                        {testExecution?.userId?.firstName ? (
                            <span>
                                Created by {testExecution?.userId?.firstName}{" "}
                                {testExecution?.userId?.lastName}{", "}
                            </span>
                        ) : null}
                        Created on {formatDate(testExecution?.createdAt || "")}
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}

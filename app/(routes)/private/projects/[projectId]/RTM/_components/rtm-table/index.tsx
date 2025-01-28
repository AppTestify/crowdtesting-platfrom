import { IRequirement } from '@/app/_interface/requirement';
import { ITestCycle } from '@/app/_interface/test-cycle';
import { ITestSuite } from '@/app/_interface/test-suite';
import { displayRTMStatus } from '@/app/_utils/common-functionality';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDown, CheckIcon, CornerRightDown, MoveRight } from 'lucide-react';
import React, { useState } from 'react'


export default function RtmTable({
    testCycle,
    testSuite,
    requirements,
    testCasesToDisplay,
    customIdCounts
}: {
    testCycle: ITestCycle;
    testSuite: ITestSuite;
    requirements: IRequirement[],
    testCasesToDisplay: any[],
    customIdCounts: any
}) {

    return (
        <div className="overflow-x-auto border rounded-md mt-4">
            <Table className="border-collapse border border-gray-200 table-fixed">
                <TableHeader>
                    <TableRow>
                        <TableCell className="border border-1 text-xs font-semibold" colSpan={5}>
                            <div className="w-full">
                                Project name: {requirements[0]?.projectId?.title} |
                                Test cycle: {testCycle?.title ? testCycle?.title : 'N/A'} |
                                Test suite: {testSuite?.title ? testSuite?.title : 'N/A'}
                            </div>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-semibold text-xs border border-r-1 text-center" colSpan={2} rowSpan={2}>
                            Test Case IDs And Their Results
                        </TableCell>
                        <TableCell className="text-center font-semibold text-xs border border-r-1" colSpan={2}>
                            Requirement IDs
                        </TableCell>
                        {requirements?.map((requirement) => (
                            <TableCell key={requirement.customId} className="text-center text-xs border border-r border-b">
                                {requirement?.customId}
                            </TableCell>
                        ))}
                    </TableRow>
                    <TableRow>
                        <TableCell className="text-xs text-center border border-r-1" colSpan={2}>
                            <div className="flex items-center justify-center">
                                <span>Total Test Cases For Requirements</span>
                                <MoveRight className="h-4 w-4 ml-1" />
                            </div>
                            <div className="mt-1 flex items-center justify-center">
                                <span>Total Requirements For Test Cases</span>
                                <ArrowDown className="h-4 w-4 ml-1" />
                            </div>
                        </TableCell>

                        {requirements?.map((requirement) => (
                            <TableCell
                                key={requirement.customId}
                                className="text-center border border-r-1 text-xs font-semibold"
                            >
                                {customIdCounts[requirement.customId]}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {testCasesToDisplay?.map((testCaseResults, index) => (
                        <TableRow key={index}>
                            <TableCell className="text-xs text-center border border-r-1 w-1/2">
                                {testCaseResults?.testCaseId?.customId}
                            </TableCell>
                            <TableCell className="text-xs text-center border w-1/2 capitalize">
                                {testCaseResults?.result
                                    ? displayRTMStatus(testCaseResults?.result as string)
                                    : displayRTMStatus('New')}
                            </TableCell>
                            <TableCell colSpan={2} className='text-center'>
                                {testCaseResults?.testCaseId?.requirements?.length}
                            </TableCell>
                            {requirements?.map((requirement) => (
                                <TableCell key={requirement.customId} className="text-center border">
                                    {testCaseResults?.testCaseId?.requirements?.some(
                                        (req: IRequirement) => req.customId === requirement.customId
                                    ) ? (
                                        <CheckIcon className="h-5 w-5 text-primary mx-auto" />
                                    ) : (
                                        <div className="h-5 w-5 mx-auto"></div>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

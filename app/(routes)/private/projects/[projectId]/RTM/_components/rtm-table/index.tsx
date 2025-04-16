import { IRequirement } from '@/app/_interface/requirement';
import { ITestSuite } from '@/app/_interface/test-suite';
import { displayRTMStatus } from '@/app/_utils/common-functionality';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDown, CheckIcon, MoveRight } from 'lucide-react';
import React from 'react'

export default function RtmTable({
    testCycle,
    testSuite,
    requirements,
    testCasesToDisplay,
    customIdCounts
}: {
    testCycle: any;
    testSuite: ITestSuite;
    requirements: IRequirement[],
    testCasesToDisplay: any[],
    customIdCounts: any
}) {
    return (
        <div className="overflow-x-auto rounded-md mt-4 mb-12">
            <div className="inline-block">
                <Table className="border-collapse border border-gray-200 table-auto">
                    <TableHeader>
                        <TableRow>
                            <TableCell className="border text-xs font-semibold" colSpan={5}>
                                <div className="w-full">
                                    Project name: {requirements[0]?.projectId?.title} |
                                    Test execution: {testCycle?.testCycle?.title || 'N/A'} |
                                    Test suite: {testSuite?.title || 'N/A'}
                                </div>
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className="font-semibold text-xs border text-center" colSpan={2} rowSpan={2}>
                                Test Case IDs And Their Results
                            </TableCell>
                            <TableCell className="text-center font-semibold text-xs border" colSpan={2}>
                                Requirement IDs
                            </TableCell>

                            {requirements?.map((requirement) => (
                                <TableCell
                                    key={requirement.customId}
                                    className="text-center text-xs border min-w-[100px]" // 👈 ensure min width
                                >
                                    {requirement?.customId}
                                </TableCell>
                            ))}
                        </TableRow>

                        <TableRow>
                            <TableCell className="text-xs text-center border" colSpan={2}>
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
                                    className="text-center border text-xs font-semibold min-w-[100px]" // 👈 again
                                >
                                    {customIdCounts[requirement.customId]}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {testCasesToDisplay?.map((testCaseResults, index) => (
                            <TableRow key={index}>
                                <TableCell className="text-xs text-center border w-1/2 min-w-[150px]">
                                    {testCaseResults?.testCaseId?.customId}
                                </TableCell>
                                <TableCell className="text-xs text-center border w-1/2 capitalize min-w-[100px]">
                                    {testCaseResults?.result
                                        ? displayRTMStatus(testCaseResults.result as string)
                                        : displayRTMStatus('New')}
                                </TableCell>
                                <TableCell colSpan={2} className="text-center min-w-[100px]">
                                    {testCaseResults?.testCaseId?.requirements?.length}
                                </TableCell>
                                {requirements?.map((requirement) => (
                                    <TableCell key={requirement.customId} className="text-center border min-w-[100px]">
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
        </div>
    );
}

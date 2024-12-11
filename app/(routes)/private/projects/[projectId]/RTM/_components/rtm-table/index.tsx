import { IRequirement } from '@/app/_interface/requirement';
import { ITestCycle } from '@/app/_interface/test-cycle';
import { ITestSuite } from '@/app/_interface/test-suite';
import { getRequirementsWithoutPaginationService } from '@/app/_services/requirement.service';
import toasterService from '@/app/_services/toaster-service';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function RtmTable({ testCycle, testSuite }:
    {
        testCycle: ITestCycle;
        testSuite: ITestSuite;
    }
) {
    const { projectId } = useParams<{ projectId: string }>();
    const [requirements, setRequirements] = useState<IRequirement[]>([]);

    const getRequirements = async () => {
        try {
            const response = await getRequirementsWithoutPaginationService(projectId);
            setRequirements(response);
        } catch (error) {
            toasterService.error();
        }
    }

    useEffect(() => {
        getRequirements()
    }, []);

    return (
        <div className="overflow-x-auto border rounded-md mt-4">
            <Table className="border-collapse border border-gray-200 table-fixed">
                <TableHeader>
                    <TableRow>
                        <TableCell
                            className="border border-1 text-xs font-semibold"
                            colSpan={5}
                        >
                            <div className='w-full'>
                                Project name : {requirements[0]?.projectId?.title} |
                                Test cycle : {testCycle?.title ? testCycle?.title : 'N/A'} |
                                Test suite : {testSuite?.title ? testSuite?.title : 'N/A'}
                            </div>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className=" font-semibold text-xs border border-r-1 text-center" colSpan={2} rowSpan={2}>
                            Test Case IDs And Their Results
                        </TableCell>
                        <TableCell className="text-center font-semibold text-xs border border-r-1" colSpan={2}>
                            Requirement IDs
                        </TableCell>
                        {
                            requirements?.map((requirement) => (
                                <TableCell className="text-center text-xs border border-r-1">
                                    {requirement?.customId}
                                </TableCell>
                            ))
                        }
                    </TableRow>
                    <TableRow>
                        <TableCell className="text-xs text-center border border-r-1" colSpan={2}>
                            <div>
                                Total Test Cases For Requirements
                            </div>
                            <div className='mt-1'>Total Requirements For Test Cases</div>
                        </TableCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {testCycle?.testCaseResults?.map((testCaseResults, index) => (
                        <TableRow key={index}>
                            <TableCell className="text-xs text-center border border-r-1 w-1/2">
                                {testCaseResults?.testCaseId?.customId}
                            </TableCell>

                            <TableCell className="text-xs text-center border w-1/2 capitalize">
                                {testCaseResults?.result}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

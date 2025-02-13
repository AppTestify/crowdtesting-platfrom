"use client";

import { ITestCycle } from '@/app/_interface/test-cycle';
import { ITestSuite } from '@/app/_interface/test-suite';
import { getTestCycleListService } from '@/app/_services/test-cycle.service';
import { getTestWithoutPaginationSuiteService } from '@/app/_services/test-suite.service';
import toasterService from '@/app/_services/toaster-service';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import RtmTable from './_components/rtm-table';
import { getRequirementsWithoutPaginationService } from '@/app/_services/requirement.service';
import { IRequirement } from '@/app/_interface/requirement';
import { statusColors } from '@/app/_utils/common-functionality';
import * as XLSX from "sheetjs-style";
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { getTestExecutionWithoutPaginationService } from '@/app/_services/test-execution.service';
import { ITestExecution } from '@/app/_interface/test-execution';

const rtmSchema = z.object({
    testCycle: z.string().optional(),
    testSuite: z.string().optional(),
});

export default function RTM() {

    const { projectId } = useParams<{ projectId: string }>();
    const [testExecutions, setTestExecutions] = useState<ITestExecution[]>([]);
    const [testSuites, setTestSuites] = useState<ITestSuite[]>([]);
    const [testSuite, setTestSuite] = useState<ITestSuite>();
    const [testCycle, setTestCycle] = React.useState<ITestCycle | undefined>(
        testExecutions.length > 0 ? testExecutions[0]?.testCycle : undefined
    );
    const [requirements, setRequirements] = useState<IRequirement[]>([]);
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [isExcelLoading, setIsExcelLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof rtmSchema>>({
        resolver: zodResolver(rtmSchema),
        defaultValues: {
            testCycle: testExecutions.length > 0 ? testExecutions[0]?.testCycle?._id : "",
            testSuite: ""
        },
    });

    const getTestCycles = async () => {
        setIsViewLoading(true);
        try {
            const response = await getTestExecutionWithoutPaginationService(projectId)
            if (response) {
                setTestExecutions(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
    }

    const getTestSuites = async () => {
        setIsViewLoading(true);
        try {
            const response = await getTestWithoutPaginationSuiteService(projectId)
            if (response) {
                setTestSuites(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
    }

    const getRequirements = async () => {
        setIsViewLoading(true);
        try {
            const response = await getRequirementsWithoutPaginationService(projectId);
            const transformedRequirements = response.sort((a: IRequirement, b: IRequirement) => a.customId.localeCompare(b.customId));
            setRequirements(transformedRequirements);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
    };

    useEffect(() => {
        localStorage.setItem("entity", "RTM");
        getTestCycles();
        getTestSuites();
        getRequirements();
    }, []);

    async function onSubmit(values: z.infer<typeof rtmSchema>) {
        try {
        } catch (error) {
            toasterService.error();
        }
    }

    // Filter for testSuite
    const filteredTestCases = React.useMemo(() => {
        const currentTestCycle = testCycle ?? testExecutions[0];

        if (currentTestCycle && testSuite) {
            return currentTestCycle.testCaseResults?.filter(
                (testCaseResult) =>
                    testCaseResult?.testCaseId?.testSuite?._id === testSuite._id
            ) ?? [];
        } else if (currentTestCycle) {
            return currentTestCycle.testCaseResults ?? [];
        }
        return [];
    }, [testCycle, testSuite, testExecutions]);
    const testCasesToDisplay = filteredTestCases.length > 0 ? filteredTestCases : [];


    // customId
    const getCustomIdCounts = () => {
        const counts: { [key: string]: number } = {};
        testCasesToDisplay?.forEach((testCase) => {
            testCase?.testCaseId?.requirements?.forEach((req: IRequirement) => {
                counts[req.customId] = (counts[req.customId] || 0) + 1;
            })
        });
        return counts;
    };
    const customIdCounts = getCustomIdCounts();

    const generateExcel = async () => {
        setIsExcelLoading(true);
        try {
            const rows = [
                ['RTM Report'],
                [`Project : ${requirements[0]?.projectId?.title || 'N/A'}`],
                [`Test Cycle : ${testCycle?.title ? testCycle?.title : testExecutions[0]?.testCycle?.title || 'N/A'} | Test Suite : ${testSuite?.title || 'N/A'}`],
                [`Generated on ${new Date().toLocaleString()}`],
                [],
                ['Test Case IDs And Their Results', '', 'Requirement IDs →', ...requirements.map(req => req.customId)],
                ['', '', 'Total Test Cases For Requirements →\nTotal Requirements For Test Cases ↓', ...requirements.map(req => String(customIdCounts[req.customId] ?? 0))]
            ];

            testCasesToDisplay.forEach((testCaseResult) => {
                const testCaseId = testCaseResult?.testCaseId?.customId || 'N/A';
                const testCaseStatus = testCaseResult?.result ? testCaseResult?.result as string : "New";
                const capitalizedStatus = testCaseStatus.charAt(0).toUpperCase() + testCaseStatus.slice(1);
                const count = testCaseResult?.testCaseId?.requirements?.length;
                const requirementMapping = requirements.map(req =>
                    testCaseResult?.testCaseId?.requirements?.map(r => r.customId).includes(req.customId) ? '✓' : ''
                );

                rows.push([testCaseId, capitalizedStatus, String(count), ...requirementMapping]);
            });

            rows.push([]);

            const ws = XLSX.utils.aoa_to_sheet(rows);

            ws['!rows'] = [
                { hpx: 40 },
                { hpx: 30 },
                { hpx: 30 },
                { hpx: 30 },
                { hpx: 10 },
                { hpx: 25 },
                { hpx: 40 },
            ];

            const merges = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
                { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
                { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } },
                { s: { r: 5, c: 0 }, e: { r: 6, c: 1 } },
            ];

            const centerAlignment = { alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
            const headerFont = { font: { bold: true } };

            ['A1', 'A2', 'A3', 'A4', 'A6', 'B6'].forEach(cell => {
                if (ws[cell]) {
                    ws[cell].s = { ...centerAlignment, ...headerFont };
                }
            });

            ws['!merges'] = merges;

            ws['!cols'] = [
                { wch: 25 },
                { wch: 20 },
                ...requirements.map(() => ({ wch: 12 }))
            ];

            rows.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    if (rowIndex >= 5) {
                        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
                        if (rowIndex >= 5 && ws[cellRef]) {
                            ws[cellRef].s = { ...centerAlignment, wrapText: true };
                        }
                    }
                });
            });

            rows.slice(5).forEach((row, rowIndex) => {
                const testCaseStatus = row[1];
                const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 5, c: 1 });

                if (statusColors[testCaseStatus]) {
                    ws[cellRef].s = {
                        ...ws[cellRef]?.s,
                        ...statusColors[testCaseStatus],
                    };
                }
            });


            const cellRef = XLSX.utils.encode_cell({ r: 6, c: 2 });
            if (ws[cellRef]) {
                ws[cellRef].s = { ...centerAlignment, alignment: { ...centerAlignment.alignment, wrapText: true } };
            }

            ws['!cols'][2] = { wch: 35 };

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'RTM Report');

            XLSX.writeFile(wb, 'RTM_Report.xlsx');
        } catch (error) {
            console.error('Error exporting Excel:', error);
        } finally {
            setIsExcelLoading(false);
        }
    };

    useEffect(() => {
        const testSuite = testSuites?.find((suite) => suite._id === form.watch("testSuite"));
        setTestSuite(testSuite);
    }, [form.watch("testSuite")]);

    useEffect(() => {
        const testCycle = testExecutions?.find((cycle) => cycle?.testCycle?._id === form.watch("testCycle"));
        setTestCycle(testCycle as unknown as ITestCycle);
        setTestSuite(undefined);
        form.setValue("testSuite", "");
    }, [form.watch("testCycle"), testExecutions]);

    return (
        <main className="mx-4 mt-2">
            <div className="">
                <h2 className="text-medium">RTM</h2>
            </div>
            <div className="mt-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                        {isViewLoading ?
                            <div className=''>
                                <div className='flex mt-4'>
                                    <Skeleton className="h-10 w-[325px] bg-gray-300" />
                                    <Skeleton className="ml-3 h-10 w-[325px] bg-gray-300" />
                                </div>
                                <div className='flex'>
                                    <Skeleton className="mt-5 h-60 w-full bg-gray-300" />
                                </div>
                            </div>
                            :
                            <div className='flex justify-between'>
                                <div className="grid grid-cols-3 w-full gap-2 mt-3">
                                    <FormField
                                        control={form.control}
                                        name="testCycle"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Test cycle</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value || testExecutions[0]?.testCycle?._id}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {testExecutions?.map((testExecution, index) => (
                                                                <SelectItem key={index} value={testExecution?.testCycle?._id as string}>
                                                                    {testExecution?.customId} - {testExecution?.testCycle?.title}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="testSuite"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Test suite</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {testSuites.map((testSuite) => (
                                                                <SelectItem key={testSuite._id} value={testSuite?._id as string}>
                                                                    {testSuite.title}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className='flex items-end'>
                                    <Button
                                        type={"button"}
                                        variant={"outline"}
                                        disabled={isExcelLoading || testCasesToDisplay.length === 0}
                                        onClick={generateExcel}
                                    >
                                        {isExcelLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet />}
                                        Export
                                    </Button>
                                </div>
                            </div>
                        }
                    </form>
                </Form>
            </div>
            {!isViewLoading && testCasesToDisplay &&
                <RtmTable
                    testCycle={testCycle as ITestCycle || testExecutions[0]}
                    testSuite={testSuite as ITestSuite}
                    requirements={requirements as IRequirement[]}
                    testCasesToDisplay={testCasesToDisplay as any[]}
                    customIdCounts={customIdCounts}
                />
            }
        </main>
    )
}

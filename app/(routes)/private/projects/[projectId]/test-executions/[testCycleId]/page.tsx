"use client";

import { formatDate } from '@/app/_constants/date-formatter';
import { ITestCaseResult } from '@/app/_interface/test-case-result';
import { getTestExecutionsService } from '@/app/_services/test-execution.service';
import toasterService from '@/app/_services/toaster-service';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
    getSortedRowModel, SortingState, useReactTable, VisibilityState
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronRight, X, Search, Filter, Download, Loader2, PlayCircle, CheckCircle2, XCircle, AlertTriangle, Clock, Users, FileText, BarChart3, TrendingUp, ChevronDown, FileSpreadsheet } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react'
import Moderate from './_components/moderate';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator }
    from '@/components/ui/breadcrumb';
import { ExportExcelFile, showTestCaseResultStatusBadge } from '@/app/_utils/common-functionality';
import { Input } from '@/components/ui/input';
import ModerateView from './_components/view-moderate';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestCaseExecutionResult, TestCaseExecutionResultList } from '@/app/_constants/test-case';
import { PAGINATION_LIMIT } from '@/app/_constants/pagination-limit';
import { useSession } from 'next-auth/react';
import { UserRoles } from '@/app/_constants/user-roles';
import { generateExcelFile } from '@/app/_helpers/generate-excel.helper';
import { TestCaseResult } from '@/app/_models/test-case-result.model';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function TestCasesInTestExecution() {
    const { data } = useSession();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [testExecution, setTestExecution] = useState<ITestCaseResult[]>([]);
    const { projectId } = useParams<{ projectId: string }>();
    const { testCycleId } = useParams<{ testCycleId: string }>();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [moderate, setModerate] = useState<ITestCaseResult | null>(null);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
    const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
    const [isExcelLoading, setIsExcelLoading] = useState<boolean>(false);
    const [isCsvLoading, setIsCsvLoading] = useState<boolean>(false);
    const [selectedResult, setSelectedResult] = useState<TestCaseExecutionResult | any>("");
    const [userData, setUserData] = useState<any>();
    const router = useRouter();

    // Statistics calculations
    const statistics = useMemo(() => {
        const total = testExecution.length;
        const passed = testExecution.filter(tc => tc.result === 'Passed').length;
        const failed = testExecution.filter(tc => tc.result === 'Failed').length;
        const blocked = testExecution.filter(tc => tc.result === 'Blocked').length;
        const caution = testExecution.filter(tc => tc.result === 'Caution').length;
        const notExecuted = testExecution.filter(tc => !tc.result).length;
        const executed = total - notExecuted;
        const executionRate = total > 0 ? Math.round((executed / total) * 100) : 0;
        const passRate = executed > 0 ? Math.round((passed / executed) * 100) : 0;

        return {
            total,
            passed,
            failed,
            blocked,
            caution,
            notExecuted,
            executed,
            executionRate,
            passRate
        };
    }, [testExecution]);

    const handleStatusChange = (status: TestCaseExecutionResult) => {
        setSelectedResult(status);
    };

    const resetFilter = () => {
        setSelectedResult("");
    }

    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const showView = (row: ITestCaseResult) => {
        setIsViewOpen(true);
        setModerate(row);
    }

    const columns: ColumnDef<ITestCaseResult>[] = useMemo(() => [
        {
            accessorKey: "customId",
            header: ({ column }) => {
                const isSorted = column.getIsSorted();
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                        className="h-8 px-2 lg:px-3"
                    >
                        Test Case ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div
                    onClick={() => showView(row as unknown as ITestCaseResult)}
                    className="hover:text-primary cursor-pointer font-medium text-blue-600 hover:text-blue-800 ml-4">
                    {row.original?.testCaseId?.customId}
                </div>
            ),
            sortingFn: "alphanumeric"
        },
        {
            accessorFn: (row) => row.testCaseId?.title || "",
            accessorKey: "title",
            id: "title",
            header: "Title",
            cell: ({ row }) => (
                <div
                    onClick={() => showView(row as unknown as ITestCaseResult)}
                    className="hover:text-primary cursor-pointer max-w-md">
                    <div className="font-medium text-gray-900 truncate">
                        {row.original?.testCaseId?.title}
                    </div>
                </div>
            ),
            filterFn: (row, columnId, filterValue) => {
                const cellValue = row.getValue(columnId) as string;
                return cellValue.toLowerCase().includes(filterValue.toLowerCase());
            },
        },
        {
            accessorKey: "severity",
            header: "Severity",
            cell: ({ row }) => {
                const severity = row.original?.testCaseId?.severity;
                const getSeverityColor = (sev: string) => {
                    switch (sev?.toLowerCase()) {
                        case 'critical': return 'bg-red-100 text-red-800 border-red-200';
                        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
                        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                        case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
                        default: return 'bg-gray-100 text-gray-800 border-gray-200';
                    }
                };
                return (
                    <Badge className={`text-xs ${getSeverityColor(severity || '')}`}>
                        {severity || 'Not Set'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "moderatedBy",
            header: "Executed By",
            cell: ({ row }) => {
                const updatedBy = row.original?.updatedBy;
                const displayName = userData?.role === UserRoles.ADMIN
                    ? `${updatedBy?.firstName || ""} ${updatedBy?.lastName || ""}`.trim()
                    : updatedBy?.customId || updatedBy?.firstName || '';

                return (
                    <div className="flex items-center gap-2">
                        {updatedBy && (
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={updatedBy?.profilePicture?.data || ""} />
                                <AvatarFallback className="text-xs">
                                    {getInitials(updatedBy?.firstName, updatedBy?.lastName)}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <span className="text-sm text-gray-900 truncate max-w-32">
                            {displayName || 'Not Assigned'}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "moderatedOn",
            header: "Executed On",
            cell: ({ row }) => (
                <div className="text-sm text-gray-600">
                    {row.original?.updatedAt ? formatDate(row.original?.updatedAt as string) : 'Not Executed'}
                </div>
            ),
        },
        {
            accessorKey: "result",
            header: "Result",
            cell: ({ row }) => {
                const result = row.original?.result;
                if (!result) {
                    return (
                        <div className="flex items-center gap-2">
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                            </Badge>
                            <TooltipProvider>
                                <Tooltip delayDuration={100}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300"
                                            onClick={() => {
                                                // Navigate to test execution page
                                                router.push(`/private/browse/${projectId}/test-execution/${row.original._id}`);
                                            }}
                                        >
                                            <PlayCircle className="h-4 w-4 text-blue-600" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Execute Test Case</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    );
                }
                return showTestCaseResultStatusBadge(result as string);
            },
        },
        {
            accessorKey: "linkedIssues",
            header: "Linked Issues",
            cell: ({ row }) => {
                const isIssue = row.original?.isIssue;
                const issueId = row.original?.issueId;
                
                // Check if this test case has an issue associated with it
                if (!isIssue && !issueId) {
                    return (
                        <span className="text-sm text-gray-500">
                            No issues
                        </span>
                    );
                }

                const getSeverityColor = (severity: string) => {
                    switch (severity?.toLowerCase()) {
                        case 'critical': return 'bg-red-100 text-red-800 border-red-200';
                        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
                        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                        case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
                        default: return 'bg-gray-100 text-gray-800 border-gray-200';
                    }
                };

                return (
                    <div className="flex items-center gap-2 flex-wrap">
                        {issueId && typeof issueId === 'object' ? (
                            <>
                                <Badge 
                                    variant="outline" 
                                    className="text-xs font-mono cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                    onClick={() => {
                                        // Navigate to specific issue
                                        router.push(`/private/browse/${projectId}/issue/${issueId._id}`);
                                    }}
                                >
                                    {issueId.customId || `#${issueId._id?.slice(-6)}`}
                                </Badge>
                                {issueId.severity && (
                                    <Badge className={`text-xs ${getSeverityColor(issueId.severity)}`}>
                                        {issueId.severity}
                                    </Badge>
                                )}
                            </>
                        ) : (
                            <Badge 
                                variant="outline" 
                                className="text-xs bg-green-50 text-green-700 border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                                onClick={() => {
                                    // Navigate to issues page
                                    router.push(`/private/projects/${projectId}/issues`);
                                }}
                            >
                                Issue created
                            </Badge>
                        )}
                    </div>
                );
            },
        },
    ], [userData]);

    const table = useReactTable({
        data: testExecution,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        globalFilterFn: "includesString",
        state: {
            sorting,
            globalFilter,
            columnVisibility,
            rowSelection,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    const refershTestExecution = () => {
        getTestExecution();
    }

    const getTestExecution = async () => {
        if (!projectId || !testCycleId) {
            console.log('Missing required params:', { projectId, testCycleId });
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await getTestExecutionsService(projectId, testCycleId, pageIndex, pageSize, selectedResult);
            setTestExecution(response?.testExecution);
            setTotalPageCount(response?.total);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    const generateExcel = async () => {
        setIsExcelLoading(true);
        try {
            const response = await getTestExecutionsService(projectId, testCycleId, 1, totalPageCount, "");
            
            // Import XLSX for direct manipulation
            const XLSX = require('sheetjs-style');
            const wb = XLSX.utils.book_new();
            
            // Create worksheet data
            const wsData: any[][] = [];
            
            // Title Section
            wsData.push(['TEST EXECUTION REPORT']);
            wsData.push([]);
            
            // Summary Information
            wsData.push(['Test Cycle:', response?.testExecution[0]?.testCycleId?.title || 'N/A']);
            wsData.push(['Export Date:', new Date().toLocaleDateString()]);
            wsData.push(['Export Time:', new Date().toLocaleTimeString()]);
            wsData.push([]);
            
            // Statistics Section Header
            wsData.push(['EXECUTION STATISTICS']);
            wsData.push([]);
            
            // Statistics Data in a nice table format
            wsData.push(['Metric', 'Value', 'Percentage']);
            wsData.push(['Total Test Cases', statistics.total, '100%']);
            wsData.push(['Executed', statistics.executed, `${statistics.executionRate}%`]);
            wsData.push(['Pending', statistics.notExecuted, `${Math.round((statistics.notExecuted / statistics.total) * 100)}%`]);
            wsData.push([]);
            wsData.push(['Result Breakdown', 'Count', 'Percentage']);
            wsData.push(['Passed', statistics.passed, statistics.executed > 0 ? `${Math.round((statistics.passed / statistics.executed) * 100)}%` : '0%']);
            wsData.push(['Failed', statistics.failed, statistics.executed > 0 ? `${Math.round((statistics.failed / statistics.executed) * 100)}%` : '0%']);
            wsData.push(['Blocked', statistics.blocked, statistics.executed > 0 ? `${Math.round((statistics.blocked / statistics.executed) * 100)}%` : '0%']);
            wsData.push(['Caution', statistics.caution, statistics.executed > 0 ? `${Math.round((statistics.caution / statistics.executed) * 100)}%` : '0%']);
            wsData.push([]);
            wsData.push([]);
            
            // Test Cases Section Header
            wsData.push(['DETAILED TEST CASE RESULTS']);
            wsData.push([]);
            
            // Test Cases Table Header
            const testCaseHeader = ['Test Case ID', 'Title', 'Severity', 'Executed By', 'Executed On', 'Result', 'Linked Issues'];
            wsData.push(testCaseHeader);
            
            // Test Cases Data
            response?.testExecution?.forEach((testCaseResult: ITestCaseResult) => {
                wsData.push([
                    testCaseResult?.testCaseId?.customId || '',
                    testCaseResult?.testCaseId?.title || '',
                    testCaseResult?.testCaseId?.severity || 'Not specified',
                    userData?.role === UserRoles.ADMIN
                        ? `${testCaseResult?.updatedBy?.firstName || ''} ${testCaseResult?.updatedBy?.lastName || ''}`.trim() || 'Not specified'
                        : testCaseResult?.updatedBy?.customId || 'Not specified',
                    testCaseResult?.updatedAt ? formatDate(testCaseResult?.updatedAt as string) : 'Not executed',
                    testCaseResult?.result || 'Pending',
                    testCaseResult?.issueId ? (
                        typeof testCaseResult.issueId === 'object' ? 
                            (testCaseResult.issueId.customId || `#${testCaseResult.issueId._id?.slice(-6)}`) : 
                            'Issue created'
                    ) : 'No issues'
                ]);
            });
            
            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            
            // Set column widths
            ws['!cols'] = [
                { width: 20 }, // A - Labels/IDs
                { width: 40 }, // B - Titles/Values
                { width: 15 }, // C - Severity/Percentage
                { width: 20 }, // D - Executed By
                { width: 15 }, // E - Date
                { width: 12 }, // F - Result
                { width: 20 }  // G - Issues
            ];
            
            // Style the report title
            ws['A1'].s = {
                font: { bold: true, size: 16, color: { rgb: "1F2937" } },
                fill: { fgColor: { rgb: "F3F4F6" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                    top: { style: "thick", color: { rgb: "1F2937" } },
                    bottom: { style: "thick", color: { rgb: "1F2937" } },
                    left: { style: "thick", color: { rgb: "1F2937" } },
                    right: { style: "thick", color: { rgb: "1F2937" } }
                }
            };
            
            // Merge title cell
            ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
            
            // Style section headers
            const sectionHeaders = [7, 17]; // Row indices for "EXECUTION STATISTICS" and "DETAILED TEST CASE RESULTS"
            sectionHeaders.forEach(rowIndex => {
                const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
                if (ws[cellRef]) {
                    ws[cellRef].s = {
                        font: { bold: true, size: 14, color: { rgb: "1F2937" } },
                        fill: { fgColor: { rgb: "E5E7EB" } },
                        alignment: { horizontal: "left", vertical: "center" }
                    };
                }
            });
            
            // Style statistics table headers
            const statsHeaders = [9, 13]; // Row indices for stats table headers
            statsHeaders.forEach(rowIndex => {
                for (let col = 0; col < 3; col++) {
                    const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: col });
                    if (ws[cellRef]) {
                        ws[cellRef].s = {
                            font: { bold: true, color: { rgb: "FFFFFF" } },
                            fill: { fgColor: { rgb: "3B82F6" } },
                            alignment: { horizontal: "center", vertical: "center" },
                            border: {
                                top: { style: "thin", color: { rgb: "000000" } },
                                bottom: { style: "thin", color: { rgb: "000000" } },
                                left: { style: "thin", color: { rgb: "000000" } },
                                right: { style: "thin", color: { rgb: "000000" } }
                            }
                        };
                    }
                }
            });
            
            // Style test case table header
            const testCaseHeaderRow = 19; // Row index for test case header
            for (let col = 0; col < testCaseHeader.length; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: testCaseHeaderRow, c: col });
                if (ws[cellRef]) {
                    ws[cellRef].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" } },
                        fill: { fgColor: { rgb: "16A34A" } },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: {
                            top: { style: "thin", color: { rgb: "000000" } },
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } }
                        }
                    };
                }
            }
            
            // Style data rows with alternating colors
            const dataStartRow = 20;
            for (let row = dataStartRow; row < wsData.length; row++) {
                const isEvenRow = (row - dataStartRow) % 2 === 0;
                const fillColor = isEvenRow ? "FFFFFF" : "F9FAFB";
                
                for (let col = 0; col < testCaseHeader.length; col++) {
                    const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                    if (ws[cellRef]) {
                        ws[cellRef].s = {
                            fill: { fgColor: { rgb: fillColor } },
                            alignment: { horizontal: "left", vertical: "top", wrapText: true },
                            border: {
                                top: { style: "thin", color: { rgb: "E5E7EB" } },
                                bottom: { style: "thin", color: { rgb: "E5E7EB" } },
                                left: { style: "thin", color: { rgb: "E5E7EB" } },
                                right: { style: "thin", color: { rgb: "E5E7EB" } }
                            }
                        };
                        
                        // Special styling for result column
                        if (col === 5) { // Result column
                            const result = ws[cellRef].v;
                            let resultColor = "000000";
                            if (result === 'Passed') resultColor = "16A34A";
                            else if (result === 'Failed') resultColor = "DC2626";
                            else if (result === 'Blocked') resultColor = "F59E0B";
                            else if (result === 'Caution') resultColor = "EAB308";
                            
                            ws[cellRef].s.font = { color: { rgb: resultColor }, bold: true };
                        }
                    }
                }
            }
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Test Execution Report');
            
            // Save file
            XLSX.writeFile(wb, `Test-Execution-Report-${response?.testExecution[0]?.testCycleId?.title || 'Data'}.xlsx`);
            
        } catch (error) {
            toasterService.error('Failed to export Excel report');
        } finally {
            setIsExcelLoading(false);
        }
    };

    const generateCSV = async () => {
        setIsCsvLoading(true);
        try {
            const response = await getTestExecutionsService(projectId, testCycleId, 1, totalPageCount, "");
            
            // Create professional CSV structure
            const csvLines = [
                "TEST EXECUTION REPORT",
                "=" + "=".repeat(50),
                "",
                `Test Cycle,${response?.testExecution[0]?.testCycleId?.title || "N/A"}`,
                `Export Date,${new Date().toLocaleDateString()}`,
                `Export Time,${new Date().toLocaleTimeString()}`,
                "",
                "EXECUTION STATISTICS",
                "-".repeat(30),
                "",
                "Overall Metrics,Count,Percentage",
                `Total Test Cases,${statistics.total},100%`,
                `Executed,${statistics.executed},${statistics.executionRate}%`,
                `Pending,${statistics.notExecuted},${Math.round((statistics.notExecuted / statistics.total) * 100)}%`,
                "",
                "Result Breakdown,Count,Percentage of Executed",
                `Passed,${statistics.passed},${statistics.executed > 0 ? Math.round((statistics.passed / statistics.executed) * 100) : 0}%`,
                `Failed,${statistics.failed},${statistics.executed > 0 ? Math.round((statistics.failed / statistics.executed) * 100) : 0}%`,
                `Blocked,${statistics.blocked},${statistics.executed > 0 ? Math.round((statistics.blocked / statistics.executed) * 100) : 0}%`,
                `Caution,${statistics.caution},${statistics.executed > 0 ? Math.round((statistics.caution / statistics.executed) * 100) : 0}%`,
                "",
                "",
                "DETAILED TEST CASE RESULTS",
                "=" + "=".repeat(50),
                ""
            ];
            
            const header = ["Test Case ID", "Title", "Severity", "Executed By", "Executed On", "Result", "Linked Issues"];

            const csvData = response?.testExecution?.map((testCaseResult: ITestCaseResult) => [
                testCaseResult?.testCaseId?.customId || "",
                `"${(testCaseResult?.testCaseId?.title || "").replace(/"/g, '""')}"`,
                testCaseResult?.testCaseId?.severity || "Not specified",
                userData?.role === UserRoles.ADMIN
                    ? `"${`${testCaseResult?.updatedBy?.firstName || ""} ${testCaseResult?.updatedBy?.lastName || ""}`.trim() || "Not specified"}"`
                    : testCaseResult?.updatedBy?.customId || "Not specified",
                testCaseResult?.updatedAt ? formatDate(testCaseResult?.updatedAt as string) : "Not executed",
                testCaseResult?.result || "Pending",
                testCaseResult?.issueId ? (
                    typeof testCaseResult.issueId === 'object' ? 
                        (testCaseResult.issueId.customId || `#${testCaseResult.issueId._id?.slice(-6)}`) : 
                        "Issue created"
                ) : "No issues",
            ]);

            // Create final CSV content
            const csvContent = [
                ...csvLines,
                header.join(','),
                ...csvData.map((row: string[]) => row.join(','))
            ].join('\n');

            // Create and download CSV file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `Test-Execution-Report-${response?.testExecution[0]?.testCycleId?.title || 'Data'}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toasterService.error('Failed to export CSV report');
        } finally {
            setIsCsvLoading(false);
        }
    };

    const hasData = table.getRowModel().rows?.length > 0;

    useEffect(() => {
        if (projectId && testCycleId) {
            getTestExecution();
        }
    }, [projectId, testCycleId, pageIndex, pageSize, selectedResult]);

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    const handlePreviousPage = () => {
        if (pageIndex > 1) {
            setPageIndex(pageIndex - 1);
        }
    };

    const handleNextPage = () => {
        if (pageIndex < Math.ceil(totalPageCount / pageSize)) {
            setPageIndex(pageIndex + 1);
        }
    };

    return (
        <div className="w-full space-y-6 p-6">
            <ModerateView
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
                moderate={moderate as ITestCaseResult}
            />
            <Moderate
                sheetOpen={isOpen}
                setSheetOpen={setIsOpen}
                testCaseResult={moderate}
                refershTestExecution={refershTestExecution}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={`/private/projects/${projectId}/test-executions`}>
                                    Test Executions
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator>
                                <ChevronRight className='h-3 w-3' />
                            </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-medium">
                                    {testExecution[0]?.testCycleId?.title || 'Test Execution Details'}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2 flex items-center gap-2">
                        <PlayCircle className="h-6 w-6 text-blue-600" />
                        Test Execution Details
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Monitor and execute test cases for this test cycle
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                disabled={!hasData || isExcelLoading || isCsvLoading}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                {(isExcelLoading || isCsvLoading) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4" />
                                )}
                                Export Report
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={generateExcel} disabled={!hasData || isExcelLoading || isCsvLoading}>
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                {isExcelLoading ? 'Exporting...' : 'Export as Excel'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={generateCSV} disabled={!hasData || isExcelLoading || isCsvLoading}>
                                <FileText className="h-4 w-4 mr-2" />
                                {isCsvLoading ? 'Exporting...' : 'Export as CSV'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Test Cases</p>
                                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Execution Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{statistics.executionRate}%</p>
                                <p className="text-xs text-gray-500">{statistics.executed}/{statistics.total}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{statistics.passRate}%</p>
                                <p className="text-xs text-gray-500">{statistics.passed} passed</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Failed</p>
                                <p className="text-2xl font-bold text-gray-900">{statistics.failed}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{statistics.notExecuted}</p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Actions */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Test Cases</CardTitle>
                            <CardDescription>
                                Execute and monitor test cases for this test cycle
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search test cases..."
                                value={(globalFilter as string) ?? ""}
                                onChange={(event) => {
                                    table.setGlobalFilter(String(event.target.value));
                                }}
                                className="pl-10"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Select
                                value={selectedResult || ""}
                                onValueChange={(value) => {
                                    handleStatusChange(value as TestCaseExecutionResult);
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter by result" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {TestCaseExecutionResultList.map((result) => (
                                            <SelectItem value={String(result)} key={result}>
                                                <div className="flex items-center">
                                                    {result}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            {selectedResult && (
                                <Button variant={'outline'} size={'icon'} onClick={resetFilter}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="bg-gray-50">
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id} className="font-medium">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                                Loading test cases...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : table && table.getRowModel() && table?.getRowModel()?.rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            className="hover:bg-gray-50"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <FileText className="h-8 w-8 text-gray-400" />
                                                <p className="text-gray-500">No test cases found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="text-sm text-gray-600">
                            Showing {((pageIndex - 1) * pageSize) + 1}-{Math.min(pageIndex * pageSize, totalPageCount)} of {totalPageCount} test cases
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={pageIndex === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                                Page {pageIndex} of {Math.ceil(totalPageCount / pageSize)}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={pageIndex >= Math.ceil(totalPageCount / pageSize)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

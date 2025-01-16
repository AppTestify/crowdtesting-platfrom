"use client";

import { formatDate } from '@/app/_constants/date-formatter';
import { ITestCaseResult } from '@/app/_interface/test-case-result';
import { getTestExecutionsService } from '@/app/_services/test-execution.service';
import toasterService from '@/app/_services/toaster-service';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
    getSortedRowModel, SortingState, useReactTable, VisibilityState
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronRight, Eye, MoreHorizontal, Play, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Moderate from './_components/moderate';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator }
    from '@/components/ui/breadcrumb';
import { showTestCaseResultStatusBadge } from '@/app/_utils/common-functionality';
import { Input } from '@/components/ui/input';
import ModerateView from './_components/view-moderate';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestCaseExecutionResult, TestCaseExecutionResultList } from '@/app/_constants/test-case';
import { PAGINATION_LIMIT } from '@/app/_constants/pagination-limit';

export default function TestCasesInTestExecution() {
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
    const [selectedResult, setSelectedResult] = useState<TestCaseExecutionResult | any>("");

    const handleStatusChange = (status: TestCaseExecutionResult) => {
        setSelectedResult(status);
    };

    const resetFilter = () => {
        setSelectedResult("");
        // setFilteredUsers(users);
    }

    const columns: ColumnDef<ITestCaseResult>[] = [
        {
            accessorKey: "customId",
            header: ({ column }) => {
                const isSorted = column.getIsSorted();
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                    >
                        ID
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div
                    onClick={() => showView(row as unknown as ITestCaseResult)}
                    className="hover:text-primary cursor-pointer ml-4">
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
                    className="capitalize hover:text-primary cursor-pointer">
                    {row.original?.testCaseId?.title}
                </div>
            ),
            filterFn: (row, columnId, filterValue) => {
                const cellValue = row.getValue(columnId) as string;
                return cellValue.toLowerCase().includes(filterValue.toLowerCase());
            },
        },
        {
            accessorKey: "actualResult",
            header: "Actual Result",
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.original?.actualResult}
                </div>
            ),
        },
        {
            accessorKey: "moderatedBy",
            header: "Moderated By",
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.original?.updatedBy}
                </div>
            ),
        },
        {
            accessorKey: "moderatedOn",
            header: "Moderated On",
            cell: ({ row }) => (
                <div className="capitalize ">
                    {row.original?.updatedAt && formatDate(row.original?.updatedAt as string)}
                </div>
            ),
        },
        {
            accessorKey: "result",
            header: "Result",
            cell: ({ row }) => (
                <div className="capitalize">
                    {showTestCaseResultStatusBadge(row.original?.result as string)}
                </div>
            ),
        },
        {
            header: "",
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <div>
                    {!row.original?.result &&
                        <>
                            <Button
                                type={'button'}
                                size={"sm"}
                                className="mb-1"
                                onClick={() => moderateOpen(row.original)}
                            >
                                <Play className="h-2 w-2" />
                            </Button>
                        </>
                    }
                </div>
            ),
        },
    ];

    const showView = (row: ITestCaseResult) => {
        setIsViewOpen(true);
        setModerate(row);
    }

    const moderateOpen = async (row: ITestCaseResult) => {
        setModerate(row);
        setIsOpen(true);
    }

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

    useEffect(() => {
        getTestExecution();
    }, [pageIndex, pageSize, selectedResult]);

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
        <main className="mx-4 mt-2">
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
            <div className="mb-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/private/projects/${projectId}/test-execution`}>
                                Test execution
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator>
                            <ChevronRight className='h-3 w-3' />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{testExecution[0]?.testCycleId?.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className='w-full'>
                <p>Moderate tests</p>
                <div className="flex py-2 mb-2 ">
                    <Input
                        placeholder="Filter test execution"
                        value={(globalFilter as string) ?? ""}
                        onChange={(event) => {
                            table.setGlobalFilter(String(event.target.value));
                        }}
                        className="max-w-sm"
                    />
                    <div className='mx-2'>
                        <Select
                            value={selectedResult || ""}
                            onValueChange={(value) => {
                                handleStatusChange(value as TestCaseExecutionResult);
                            }}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Search by result" />
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
                    </div>
                    {selectedResult ?
                        <div>
                            <Button onClick={resetFilter} className="px-3 bg-red-500 hover:bg-red-500">
                                <X />
                            </Button>
                        </div>
                        : null
                    }
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
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
                            {table && table.getRowModel() && table?.getRowModel()?.rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
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
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        {!isLoading ? "No results" : "Loading"}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">

                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={pageIndex === 1}
                        >
                            Previous
                        </Button>
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
            </div>
        </main>
    )
}

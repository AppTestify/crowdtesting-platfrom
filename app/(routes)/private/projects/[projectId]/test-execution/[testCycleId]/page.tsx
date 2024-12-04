"use client";

import { formatDate } from '@/app/_constants/date-formatter';
import { ITestCaseResult } from '@/app/_interface/test-case-result';
import { getTestExecutionsService } from '@/app/_services/test-execution.service';
import toasterService from '@/app/_services/toaster-service';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';
import { ArrowUpDown, ChevronsRight, Play, Triangle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Moderate from './_components/moderate';

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
                <div className="hover:text-primary cursor-pointer ml-4">
                    {row.original?.testCaseId?.customId}
                </div>
            ),
            sortingFn: "alphanumeric"
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="capitalize hover:text-primary cursor-pointer">
                    {row.original?.testCaseId?.title}
                </div>
            ),
        },
        {
            accessorKey: "expectedResult",
            header: "Expected Result",
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.original?.testCaseId?.expectedResult}
                </div>
            ),
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
                    {/* {row.original?.testCaseId?.expectedResult} */}
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
                    {/* {row.original?.updatedAt} */}
                </div>
            ),
        },
        {
            header: "Action",
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <div>
                    <Button size={"sm"} onClick={() => moderateOpen(row.original)}>
                        <Triangle className='w-3 h-3' />
                    </Button>
                </div>
            ),
        },
    ];

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

    const getTestCycle = async () => {
        setIsLoading(true);
        try {
            const response = await getTestExecutionsService(projectId, testCycleId);
            setTestExecution(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getTestCycle();
    }, []);

    return (
        <main className="mx-4 mt-2">
            <Moderate
                sheetOpen={isOpen}
                setSheetOpen={setIsOpen}
                testCaseResult={moderate}
            />
            <div className="mb-4">
                <h2 className="text-medium flex text-primary">
                    <Link href={`/private/projects/${projectId}/test-execution`}>
                        Test execution
                    </Link>
                    <div className='flex items-center justify-center ml-1 text-black'>
                        <ChevronsRight className='h-4 w-4 ' />
                        <p className='ml-1'>
                            {testExecution[0]?.testCycleId?.title} ({testExecution[0]?.testCycleId?.customId})
                        </p>
                    </div>
                </h2>
                {/* <span className="text-xs text-gray-600">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    cumque vel nesciunt sunt velit possimus sapiente tempore repudiandae fugit fugiat.
                </span> */}
            </div>
            <div className='w-full'>
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
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>

                    <div className="flex space-x-2">
                        {/* <Button
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
                        </Button> */}
                    </div>
                </div>
            </div>
        </main>
    )
}

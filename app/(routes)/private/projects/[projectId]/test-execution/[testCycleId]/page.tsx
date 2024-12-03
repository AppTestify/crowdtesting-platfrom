"use client";

import { ITestCaseResult } from '@/app/_interface/test-case-result';
import { getTestExecutionsService } from '@/app/_services/test-execution.service';
import toasterService from '@/app/_services/toaster-service';
import { Button } from '@/components/ui/button';
import { ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function TestCasesInTestExecution() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [testExecution, setTestExecution] = useState<ITestCaseResult[]>([]);
    const { projectId } = useParams<{ projectId: string }>();
    const { testCycleId } = useParams<{ testCycleId: string }>();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);

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
                    {row.getValue("customId")}</div>
            ),
            sortingFn: "alphanumeric"
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="capitalize hover:text-primary cursor-pointer">
                    {row.getValue("title")}</div>
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("description")}</div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            // cell: ({ row }) => (
            //     <TestExecutionRowActions row={row as Row<ITestCycle>} refreshTestCycle={refreshTestCycle} />
            // ),
        },
    ];

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
            setTestExecution(response?.testCycles);
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
            <div className="">
                <h2 className="text-medium">Test execution</h2>
                {/* <span className="text-xs text-gray-600">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    cumque vel nesciunt sunt velit possimus sapiente tempore repudiandae fugit fugiat.
                </span> */}
            </div>
        </main>
    )
}

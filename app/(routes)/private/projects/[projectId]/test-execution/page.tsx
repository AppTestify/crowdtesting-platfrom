"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
    ColumnDef,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { ITestCyclePayload } from "@/app/_interface/test-cycle";
import { ArrowUpDown, ChartNoAxesGantt } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { AddTestExecution } from "./_components/add-test-execution";
import { getTestExecutionService } from "@/app/_services/test-execution.service";

export default function TestExecution() {
    const [testExecution, setTestExecution] = useState<ITestCyclePayload[]>([]);

    const columns: ColumnDef<ITestCyclePayload>[] = [
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
                <div className="text-primary cursor-pointer ml-4">
                    {row.original?.testCycle?.customId}
                </div>
            ),
            sortingFn: "alphanumeric"
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="capitalize hover:text-primary cursor-pointer">
                    {row.original?.testCycle?.title}
                </div>
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <div
                    title={row.original?.testCycle?.description}
                    className="capitalize w-48 overflow-hidden text-ellipsis line-clamp-2"
                >
                    {row.original?.testCycle?.description}
                </div>
            ),
        },
        {
            accessorKey: "totalTestCases",
            header: "Total Test Cases",
            cell: ({ row }) => (
                <div className="capitalize flex gap-1">
                    <div className="w-6 h-6 border border-1 bg-primary rounded-full text-white flex items-center justify-center">
                        {row.original?.resultCounts?.passed}
                    </div>
                    <div className="w-6 h-6 border border-1 bg-destructive rounded-full text-white flex items-center justify-center">
                        {row.original?.resultCounts?.failed}
                    </div>
                    <div className="w-6 h-6 border border-1 bg-yellow-500 rounded-full text-white flex items-center justify-center">
                        {row.original?.resultCounts?.caused}
                    </div>
                    <div className="w-6 h-6 border border-1 bg-gray-500 rounded-full text-white flex items-center justify-center">
                        {row.original?.resultCounts?.blocked}
                    </div>
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <div className="">
                    <Button variant={"outline"} size={"sm"} className="px-2 text-sm " >
                        {row.original?.testCycle?.testCases && row.original?.testCycle?.testCases.length > 0 ?
                            <Link href={`/private/projects/${projectId}/test-execution/${row.original?.id}`}>
                                <div className="flex items-center">
                                    <ChartNoAxesGantt className="h-5 w-5 mr-2" />
                                    Test cases
                                </div>
                            </Link> :
                            <TooltipProvider>
                                <Tooltip delayDuration={200}>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center text-gray-500 cursor-not-allowed">
                                            <ChartNoAxesGantt className="h-5 w-5 mr-2" />
                                            Test cases
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-black">
                                        <p>First assign test cases</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        }
                    </Button>
                </div>
            ),
        },
    ];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
    const { projectId } = useParams<{ projectId: string }>();

    useEffect(() => {
        getTestCycle();
    }, [pageIndex, pageSize]);

    const getTestCycle = async () => {
        setIsLoading(true);
        const response = await getTestExecutionService(projectId, pageIndex, pageSize, "");
        setTestExecution(response?.testCycles);
        setTotalPageCount(response?.total);
        setIsLoading(false);
    };

    const tableData = useMemo(() => testExecution?.map((testExecute) => testExecute) || [], [testExecution]);
    const table = useReactTable({
        data: tableData,
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

    const refreshTestExecution = () => {
        getTestCycle();
    }

    useEffect(() => {
        if (pageIndex) {
            localStorage.setItem("entity", "TestExecution");
        }
    }, [pageIndex]);

    return (
        <main className="mx-4 mt-2">
            <div className="">
                <h2 className="text-medium">Test execution</h2>
            </div>
            <div className="w-full">
                <div className="flex py-4 justify-between">
                    <Input
                        placeholder="Filter test execution"
                        value={(globalFilter as string) ?? ""}
                        onChange={(event) => {
                            table.setGlobalFilter(String(event.target.value));
                        }}
                        className="max-w-sm"
                    />

                    <AddTestExecution refreshTestExecution={refreshTestExecution} />
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
    );
}

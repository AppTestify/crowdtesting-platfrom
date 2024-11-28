"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
    ColumnDef,
    Row,
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
import { PAGINATION_LIMIT } from "@/app/_utils/common";
import { formatDate } from "@/app/_constants/date-formatter";
import { ITestPlan, ITestPlanPayload } from "@/app/_interface/test-plan";
import { getTestPlanService } from "@/app/_services/test-plan.service";
import { AddTestPlan } from "./_components/add-test-plan";
import { TestPlansRowActions } from "./_components/row-actions";
import ViewTestPlan from "./_components/view-test-plan";
import { ArrowUpDown } from "lucide-react";

export default function TestPlan() {
    const [testPlans, setTestPlans] = useState<ITestPlanPayload[]>([]);

    const columns: ColumnDef<ITestPlanPayload>[] = [
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
                <div className="hover:text-primary cursor-pointer ml-4" onClick={() => getTestPlan(row.original as ITestPlan)}>
                    {row.getValue("customId")}</div>
            ),
            sortingFn: "alphanumeric"
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="capitalize hover:text-primary cursor-pointer" onClick={() => getTestPlan(row.original as ITestPlan)}>
                    {row.getValue("title")}</div>
            ),
        },
        ...(
            testPlans.some((item) => item.userId?._id) ?
                [{
                    accessorKey: "Name",
                    header: "Owner",
                    cell: ({ row }: { row: any }) => (
                        <div className="">{`${row.original?.userId?.firstName} ${row.original?.userId?.lastName}`}</div>
                    ),
                }] : []
        ),
        {
            accessorKey: "createdAt",
            header: "Created On",
            cell: ({ row }) => (
                <div className="capitalize">
                    {formatDate(row.getValue("createdAt"))}
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <TestPlansRowActions row={row as Row<ITestPlan>} refreshTestPlans={refreshTestPlans} />
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
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [testPlan, setTestPlan] = useState<ITestPlan>();
    const { projectId } = useParams<{ projectId: string }>();

    useEffect(() => {
        getTestPlans();
    }, [pageIndex, pageSize]);

    const getTestPlans = async () => {
        setIsLoading(true);
        const response = await getTestPlanService(projectId, pageIndex, pageSize);
        setTestPlans(response?.testPlans);
        setTotalPageCount(response?.total);
        setIsLoading(false);
    };

    const refreshTestPlans = () => {
        getTestPlans();
        setRowSelection({});
    };

    const getTestPlan = async (data: ITestPlan) => {
        setTestPlan(data as ITestPlan);
        setIsViewOpen(true);
    };

    const table = useReactTable({
        data: testPlans,
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

    return (
        <main className="mx-4 mt-2">
            <ViewTestPlan
                testPlan={testPlan as ITestPlan}
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
            />
            <div className="">
                <h2 className="text-medium">Test plans</h2>
                <span className="text-xs text-gray-600">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    cumque vel nesciunt sunt velit possimus sapiente tempore repudiandae fugit fugiat.
                </span>
            </div>
            <div className="w-full">
                <div className="flex py-4 justify-between">
                    <Input
                        placeholder="Filter test plans"
                        value={(globalFilter as string) ?? ""}
                        onChange={(event) => {
                            table.setGlobalFilter(String(event.target.value));
                        }}
                        className="max-w-sm"
                    />
                    <div className="flex gap-2 ml-2">
                        <AddTestPlan refreshTestPlans={refreshTestPlans} />
                    </div>
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
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>

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

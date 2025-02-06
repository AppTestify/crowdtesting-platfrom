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
import { getTestCycleService } from "@/app/_services/test-cycle.service";
import { ITestCycle } from "@/app/_interface/test-cycle";
import { AddTestCycle } from "./_components/add-test-cycle";
import { TestCycleRowActions } from "./_components/row-actions";
import { formatDateWithoutTime } from "@/app/_constants/date-formatter";
import TestCycleView from "./_components/view-test-cycle";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { DBModels } from "@/app/_constants";
import { checkProjectActiveRole } from "@/app/_utils/common-functionality";
import { IProject } from "@/app/_interface/project";
import { getProjectService } from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";

export default function TestPlan() {
    const [testCycle, setTestCycle] = useState<ITestCycle[]>([]);
    const [userData, setUserData] = useState<any>();
    const [project, setProject] = useState<IProject>();

    const columns: ColumnDef<ITestCycle>[] = [
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div
                    title={row.getValue("title")}
                    className="capitalize hover:text-primary cursor-pointer" onClick={() => ViewTestCycle(row.original as ITestCycle)}>
                    {row.getValue("title")}</div>
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <div
                    title={row.getValue("description")}
                    className="capitalize w-48 overflow-hidden text-ellipsis line-clamp-2">
                    {row.getValue("description")}
                </div>
            ),
        },
        {
            accessorKey: "estimation",
            header: "Start Date - End Date",
            cell: ({ row }) => (
                <div
                    className="capitalize">
                    {formatDateWithoutTime(row.original?.startDate)} - {formatDateWithoutTime(row.original?.endDate)}
                </div>
            ),
        },
        ...(
            testCycle.some((item) => item?.userId?._id) ?
                [{
                    accessorKey: "createdBy",
                    header: "Created By",
                    cell: ({ row }: { row: any }) => (
                        <div className="">{`${row.original?.userId?.firstName || ""} ${row.original?.userId?.lastName || ""}`}</div>
                    ),
                }] : []
        ),
        ...(
            userData?.role != UserRoles.TESTER && checkProjectActiveRole(project?.isActive ?? false, userData) ?
                [{
                    id: "actions",
                    enableHiding: false,
                    cell: ({ row }: { row: any }) => (
                        <TestCycleRowActions row={row as Row<ITestCycle>} refreshTestCycle={refreshTestCycle} />
                    ),
                }] : []
        )
    ];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [pageIndex, setPageIndex] = useState<number>(() => {
        const entity = localStorage.getItem("entity");
        if (entity === DBModels.TEST_CYCLE) {
            return Number(localStorage.getItem("currentPage")) || 1;
        }
        return 1;
    });
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
    const [testCycleData, setTestCycleData] = useState<ITestCycle>();
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
    const { projectId } = useParams<{ projectId: string }>();
    const { data } = useSession();

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    useEffect(() => {
        const debounceFetch = setTimeout(() => {
            getTestCycle();
        }, 500);
        return () => clearTimeout(debounceFetch);
    }, [globalFilter, pageIndex, pageSize]);

    useEffect(() => {
        if ((Array.isArray(globalFilter) && globalFilter.length > 0) || (typeof globalFilter === 'string' && globalFilter.trim() !== "")) {
            setPageIndex(1);
        }
    }, [globalFilter]);

    useEffect(() => {
        localStorage.setItem("currentPage", pageIndex.toString());
        localStorage.setItem("entity", DBModels.TEST_CYCLE);
    }, [pageIndex]);

    const ViewTestCycle = (testCycle: ITestCycle) => {
        setTestCycleData(testCycle);
        setIsViewOpen(true);
    }

    const getTestCycle = async () => {
        setIsLoading(true);
        const response = await getTestCycleService(projectId, pageIndex, pageSize, globalFilter as unknown as string);
        setTestCycle(response?.testCycles);
        setTotalPageCount(response?.total);
        setIsLoading(false);
    };


    const refreshTestCycle = () => {
        getTestCycle();
        setRowSelection({});
    };

    const table = useReactTable({
        data: testCycle,
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
            // globalFilter,
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

    const getProject = async () => {
        setIsLoading(true);
        try {
            const response = await getProjectService(projectId);
            if (response) {
                setProject(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getProject();
    }, []);

    return (
        <main className="mx-4 mt-2">
            <TestCycleView
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
                testCycle={testCycleData as ITestCycle}
            />
            <div className="">
                <h2 className="text-medium">Test cycle</h2>
                <span className="text-xs text-gray-600">
                    A series of iterative testing phases, including planning, execution, and closure,
                    to validate product functionality.
                </span>
            </div>
            <div className="w-full">
                <div className="flex py-4 justify-between">
                    <Input
                        placeholder="Filter test cycle"
                        value={(globalFilter as string) ?? ""}
                        onChange={(event) => {
                            table.setGlobalFilter(String(event.target.value));
                        }}
                        className="max-w-sm"
                    />
                    {userData?.role != UserRoles.TESTER && checkProjectActiveRole(project?.isActive ?? false, userData) &&
                        <div className="flex gap-2 ml-2">
                            <AddTestCycle refreshTestCycle={refreshTestCycle} />
                        </div>
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
    );
}

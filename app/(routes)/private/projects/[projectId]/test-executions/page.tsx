"use client";

import { useEffect, useMemo, useState } from "react";
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
import { ITestCyclePayload } from "@/app/_interface/test-cycle";
import { ArrowUpDown, ChartNoAxesGantt } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { AddTestExecution } from "./_components/add-test-execution";
import { getTestExecutionService } from "@/app/_services/test-execution.service";
import { formatDateWithoutTime } from "@/app/_constants/date-formatter";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { TestExecutionRowActions } from "./_components/row-actions";
import { ITestExecution } from "@/app/_interface/test-execution";
import TestExecutionView from "./_components/view-test-execution";
import { checkProjectAdmin } from "@/app/_utils/common";
import { IProject } from "@/app/_interface/project";
import { getProjectService } from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";

export default function TestExecution() {
    const [testExecution, setTestExecution] = useState<ITestCyclePayload[]>([]);
    const [userData, setUserData] = useState<any>();
    const [project, setProject] = useState<IProject>();
    const checkProjectRole = checkProjectAdmin(project as IProject, userData);

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
                <div className="text-primary cursor-pointer ml-4" onClick={() => openTestExecutionView(row as Row<ITestCyclePayload>)}>
                    {row.original?.customId}
                </div>
            ),
            sortingFn: "alphanumeric"
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="capitalize hover:text-primary cursor-pointer" onClick={() => openTestExecutionView(row as Row<ITestCyclePayload>)}>
                    {row.original?.testCycle?.title}
                </div>
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => {
                const description = row.original?.testCycle?.description;
                return (
                    <div
                        title={description}
                        className="capitalize line-clamp-2"
                    >
                        {description && description.length > 30 ? `${description.substring(0, 30)}...` : description}
                    </div>
                )
            },
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <div
                    title={row.original?.type}
                    className=""
                >
                    {row.original?.type}
                </div>
            ),
        },
        {
            accessorKey: "startDate",
            header: "Start Date",
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.original?.startDate !== null ? (
                        <span>{formatDateWithoutTime(row.getValue("startDate"))}</span>
                    ) : (
                        <span className="text-gray-400">Not available</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "endDate",
            header: "End Date",
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.original?.endDate !== null ? (
                        <span>{formatDateWithoutTime(row.getValue("endDate"))}</span>
                    ) : (
                        <span className="text-gray-400">Not available</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "totalTestCases",
            header: "Total Test Cases",
            cell: ({ row }) => (
                <TooltipProvider delayDuration={40}>

                    <div className="capitalize flex gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-6 h-6 border border-1 bg-primary rounded-full text-white flex items-center justify-center">
                                    {row.original?.resultCounts?.passed}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Passed</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip >
                            <TooltipTrigger asChild>
                                <div className="w-6 h-6 border border-1 bg-destructive rounded-full text-white flex items-center justify-center">
                                    {row.original?.resultCounts?.failed}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-destructive">
                                <p>Failed</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-6 h-6 border border-1 bg-yellow-500 rounded-full text-white flex items-center justify-center">
                                    {row.original?.resultCounts?.caused}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-yellow-500">
                                <p>Caution</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-6 h-6 border border-1 bg-gray-500 rounded-full text-white flex items-center justify-center">
                                    {row.original?.resultCounts?.blocked}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-500">
                                <p>Blocked</p>
                            </TooltipContent>
                        </Tooltip>

                    </div>

                </TooltipProvider>
            ),
        },
        {
            id: "testCases",
            enableHiding: false,
            cell: ({ row }) => (
                <div className="">
                    {row.original?.testCycle?.testCases && row.original?.testCycle?.testCases.length > 0 ?
                        <Link href={`/private/projects/${projectId}/test-executions/${row.original?.id}`}>
                            <div className="flex items-center">
                                <TooltipProvider>
                                    <Tooltip delayDuration={20}>
                                        <TooltipTrigger asChild>
                                            <Button variant={"outline"} size={"sm"} >
                                                <ChartNoAxesGantt className="h-5 w-5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Test cases</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </Link> :
                        <TooltipProvider>
                            <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center text-gray-500 cursor-not-allowed">
                                        <Button variant={"outline"} size={"sm"} >
                                            <ChartNoAxesGantt className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>First assign test cases</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    }
                </div>
            ),
        },
        ...(
            userData?.role !== UserRoles.TESTER ?
                [{
                    id: "actions",
                    enableHiding: false,
                    cell: ({ row }: { row: any }) => (
                        <TestExecutionRowActions row={row as Row<ITestExecution>} refreshTestExecution={refreshTestExecution} />
                    ),
                }] : []
        )
    ];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [testExecutionView, setTestExecutionView] = useState<ITestExecution>();
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
    const { projectId } = useParams<{ projectId: string }>();
    const [isViewOpen, setIsViewOpen] = useState(false);
    const { data } = useSession();

    const getProject = async () => {
        setIsLoading(true);
        try {
            const response = await getProjectService(projectId);
            setProject(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getProject();
    }, []);

    useEffect(() => {
        const debounceFetch = setTimeout(() => {
            getTestExecution();
        }, 500);
        return () => clearTimeout(debounceFetch);
    }, [pageIndex, pageSize, globalFilter]);

    const getTestExecution = async () => {
        setIsLoading(true);
        const response = await getTestExecutionService(projectId, pageIndex, pageSize, globalFilter as unknown as string);
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
        getTestExecution();
    }

    const openTestExecutionView = (row: Row<ITestCyclePayload>) => {
        setIsViewOpen(true);
        setTestExecutionView(row.original as unknown as ITestExecution);
    }

    useEffect(() => {
        if (pageIndex) {
            localStorage.setItem("entity", "TestExecution");
        }
    }, [pageIndex]);

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    return (
        <main className="mx-4 mt-2">
            <TestExecutionView
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
                testExecution={testExecutionView as ITestExecution}
            />
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

                    {(userData?.role === UserRoles.ADMIN || userData?.role === UserRoles.PROJECT_ADMIN || checkProjectRole) &&
                        (<AddTestExecution refreshTestExecution={refreshTestExecution} />)
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

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
import { getTestSuiteService } from "@/app/_services/test-suite.service";
import { AddTestSuite } from "./_components/add-test-suite";
import { formatDate } from "@/app/_constants/date-formatter";
import { ITestSuite } from "@/app/_interface/test-suite";
import { TestSuiteRowActions } from "./_components/row-actions";
import ViewTestSuite from "./_components/view-test-suite";
import { ArrowUpDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { DBModels } from "@/app/_constants";

export default function TestSuite() {
    const [testSuite, setTestSuite] = useState<ITestSuite[]>([]);
    const [userData, setUserData] = useState<any>();

    const columns: ColumnDef<ITestSuite>[] = [
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
                <div className="hover:text-primary cursor-pointer ml-4" onClick={() => getTestSuite(row.original as ITestSuite)}>
                    {row.getValue("customId")}</div>
            ),
            sortingFn: "alphanumeric"
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="capitalize hover:text-primary cursor-pointer" onClick={() => getTestSuite(row.original as ITestSuite)}>
                    {row.getValue("title")}</div>
            ),
        },
        ...(
            testSuite.some((item) => item.userId?._id) ?
                [{
                    accessorKey: "CreatedBy",
                    header: "Created By",
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
        ...(
            userData?.role != UserRoles.TESTER ?
                [
                    {
                        id: "actions",
                        enableHiding: false,
                        cell: ({ row }: { row: any }) => (
                            <TestSuiteRowActions row={row as Row<ITestSuite>} refreshTestSuites={refreshTestSuites} />
                        ),
                    }
                ] : []
        )
    ];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [pageIndex, setPageIndex] = useState<number>(() => {
        const entity = localStorage.getItem("entity");
        if (entity === DBModels.TEST_SUITE) {
            return Number(localStorage.getItem("currentPage")) || 1;
        }
        return 1;
    });
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [testSuiteData, setTestSuiteData] = useState<ITestSuite>();
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
        getTestSuites();
    }, [pageIndex, pageSize]);

    useEffect(() => {
        localStorage.setItem("currentPage", pageIndex.toString());
        localStorage.setItem("entity", DBModels.TEST_SUITE);
    }, [pageIndex]);

    const getTestSuites = async () => {
        setIsLoading(true);
        const response = await getTestSuiteService(projectId, pageIndex, pageSize);
        setTestSuite(response?.testSuites);
        setTotalPageCount(response?.total);
        setIsLoading(false);
    };

    const refreshTestSuites = () => {
        getTestSuites();
        setRowSelection({});
    };

    const getTestSuite = async (data: ITestSuite) => {
        setTestSuiteData(data as ITestSuite);
        setIsViewOpen(true);
    };

    const table = useReactTable({
        data: testSuite,
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
            <ViewTestSuite
                testSuite={testSuiteData as ITestSuite}
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
            />
            <div className="">
                <h2 className="text-medium">Test suites</h2>
                <span className="text-xs text-gray-600">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    cumque vel nesciunt sunt velit possimus sapiente tempore repudiandae fugit fugiat.
                </span>
            </div>
            <div className="w-full">
                <div className="flex py-4 justify-between">
                    <Input
                        placeholder="Filter test suite"
                        value={(globalFilter as string) ?? ""}
                        onChange={(event) => {
                            table.setGlobalFilter(String(event.target.value));
                        }}
                        className="max-w-sm"
                    />
                    {userData?.role != UserRoles.TESTER &&
                        <div className="flex gap-2 ml-2">
                            <AddTestSuite refreshTestSuites={refreshTestSuites} />
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
                                            <TableCell key={cell.id}
                                                className={`${userData?.role != UserRoles.TESTER ? "" : "py-3"}`}>
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

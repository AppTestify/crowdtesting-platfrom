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
import { formatDate } from "@/app/_constants/date-formatter";
import { getTestCaseService } from "@/app/_services/test-case.service";
import { ITestCase } from "@/app/_interface/test-case";
import { AddTestCase } from "./_components/add-test-case";
import toasterService from "@/app/_services/toaster-service";
import { getTestWithoutPaginationSuiteService } from "@/app/_services/test-suite.service";
import { ITestSuite } from "@/app/_interface/test-suite";
import { TestCaseRowActions } from "./_components/row-actions";
import ViewTestCase from "./_components/view-test-case";
import { ArrowUpDown, X } from "lucide-react";
import ExpandableTable from "@/app/_components/expandable-table";
import { IRequirement } from "@/app/_interface/requirement";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRequirementsWithoutPaginationService } from "@/app/_services/requirement.service";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { DBModels } from "@/app/_constants";

export default function TestCases() {
    const [testCases, setTestCases] = useState<ITestCase[]>([]);
    const [userData, setUserData] = useState<any>();

    const columns: ColumnDef<ITestCase>[] = [
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
                <div className="text-primary cursor-pointer ml-4" onClick={() => getTestCase(row.original as unknown as ITestCase)}>
                    {row.getValue("customId")}</div>
            ),
            sortingFn: "alphanumeric"
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div
                    title={row.getValue("title")}
                    className="capitalize hover:text-primary cursor-pointer w-48 overflow-hidden text-ellipsis line-clamp-2"
                    onClick={() => getTestCase(row.original as unknown as ITestCase)}>
                    {row.getValue("title")}
                </div>
            ),
        },
        {
            accessorFn: (row) => row.testSuite?.title || "",
            accessorKey: "testSuite",
            header: "Test suite",
            cell: ({ row }) => (
                <div className="capitalize">{row.original.testSuite?.title}</div>
            ),
        },
        {
            accessorKey: "requirements",
            header: "Requirements",
            cell: ({ row }) => (
                <div className="capitalize">
                    <ExpandableTable row={row?.original?.requirements as IRequirement[]} />
                </div>
            ),
        },
        ...(
            testCases.some((item) => item?.userId?._id) ?
                [{
                    accessorKey: "createdBy",
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
                [{
                    id: "actions",
                    enableHiding: false,
                    cell: ({ row }: { row: any }) => (
                        <TestCaseRowActions row={row as unknown as Row<ITestCase>} testSuites={testSuites} refreshTestCases={refreshTestCases} />
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
        if (entity === DBModels.TEST_CASE) {
            return Number(localStorage.getItem("currentPage")) || 1;
        }
        return 1;
    });
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
    const { projectId } = useParams<{ projectId: string }>();
    const [testSuites, setTestSuites] = useState<ITestSuite[]>([]);
    const [testCase, setTestCase] = useState<ITestCase>();
    const [requirements, setRequirements] = useState<IRequirement[]>([]);
    const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
    const [selectedRequirement, setSelectedRequirment] = useState<string>("");
    const { data } = useSession();

    const resetFilter = () => {
        setSelectedRequirment("");
    }

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    useEffect(() => {
        getTestCases();
    }, [pageIndex, pageSize, selectedRequirement]);

    const getTestCases = async () => {
        setIsLoading(true);
        const response = await getTestCaseService(projectId, pageIndex, pageSize, selectedRequirement);
        setTestCases(response?.testCases);
        setTotalPageCount(response?.total);
        setIsLoading(false);
    };

    const handleRequirementChange = (requirment: string) => {
        setSelectedRequirment(requirment);
    };

    useEffect(() => {
        getTestSuites();
        getRequirements();
    }, []);

    useEffect(() => {
        localStorage.setItem("currentPage", pageIndex.toString());
        localStorage.setItem("entity", DBModels.TEST_CASE);
    }, [pageIndex]);

    const getRequirements = async () => {
        try {
            const response = await getRequirementsWithoutPaginationService(projectId);
            if (response) {
                setRequirements(response);
            }
        } catch (error) {
            toasterService.error();
        }
    }

    const getTestSuites = async () => {
        try {
            const response = await getTestWithoutPaginationSuiteService(projectId);
            setTestSuites(response);
        } catch (error) {
            toasterService.error();
        }
    }

    const refreshTestCases = () => {
        getTestCases();
        setRowSelection({});
    };

    const table = useReactTable({
        data: testCases,
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

    const getTestCase = async (data: ITestCase) => {
        setTestCase(data as ITestCase);
        setIsViewOpen(true);
    };

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
            <ViewTestCase
                testCase={testCase as ITestCase}
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
            />
            <div className="">
                <h2 className="text-medium">Test cases</h2>
            </div>
            <div className="w-full">
                <div className="flex py-4 items-center">
                    <Input
                        placeholder="Filter test cases"
                        value={(globalFilter as string) ?? ""}
                        onChange={(event) => {
                            table.setGlobalFilter(String(event.target.value));
                        }}
                        className="max-w-sm"
                    />
                    <div className='mx-2'>
                        <Select
                            value={selectedRequirement || ""}
                            onValueChange={(value) => {
                                handleRequirementChange(value as string);
                            }}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Search by result" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {requirements.map((requirement) => (
                                        <SelectItem value={requirement?.id as string} key={requirement.id}>
                                            <div className="flex items-center">
                                                {requirement.title}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedRequirement ?
                        <div>
                            <Button onClick={resetFilter} className="px-3 bg-red-500 hover:bg-red-500">
                                <X />
                            </Button>
                        </div>
                        : null
                    }
                    {
                        userData?.role != UserRoles.TESTER &&
                        <div className="flex gap-2 ml-auto">
                            <AddTestCase refreshTestCases={refreshTestCases} testSuites={testSuites} />
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

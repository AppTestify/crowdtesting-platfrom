"use client";

import { useEffect, useState } from "react";
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
import { useParams } from "next/navigation";
import { ITestCase } from "@/app/_interface/test-case";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import toasterService from "@/app/_services/toaster-service";
import { getTestCaseWithoutPaginationService } from "@/app/_services/test-case.service";
import { ITestCycle } from "@/app/_interface/test-cycle";
import { assignTestCase, getAssignTestCaseService, unAssignTestCase } from "@/app/_services/test-cycle.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileInput, FileOutput, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";

export default function AssignTestCase({ sheetOpen, setSheetOpen, row }:
    {
        sheetOpen: boolean;
        setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
        row: Row<ITestCycle>;
    }
) {
    // Un-Assigned Test case
    const columns: ColumnDef<ITestCase>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "customId",
            header: "ID",
            cell: ({ row }) => (
                <div>
                    {row.getValue("customId")}</div>
            ),
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="capitalize ">
                    {row.getValue("title")}</div>
            ),
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <div className="capitalize ">
                    {row.original?.testType}</div>
            ),
        },
        {
            id: "unAssign",
            header: "",
            cell: ({ row }) => (
                <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => singleUnAssign(row.original._id as string)} >
                            {unassignedLoading && loadingRowIdUnAssign === row.original._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileOutput />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className='bg-black'>
                        <p>Unassign</p>
                    </TooltipContent>
                </Tooltip>
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ];

    // Assign test cases
    const assignTestCaseColumns: ColumnDef<ITestCase>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "customId",
            header: "ID",
            cell: ({ row }) => (
                <div className="hover:cursor-pointer"
                >
                    {row.getValue("customId")}
                </div>
            ),
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="capitalize ">
                    {row.getValue("title")}</div>
            ),
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <div className="capitalize ">
                    {row.original?.testType}</div>
            ),
        },
        {
            id: "assign",
            header: "",
            cell: ({ row }) => (
                <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => singleAssign(row.original?._id as string)} >
                            {assignedLoading && loadingRowIdAssign === row.original._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileInput />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className='bg-black'>
                        <p>Assign</p>
                    </TooltipContent>
                </Tooltip>
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ];

    const testCycleId = row?.original?.id;
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [unAssignrowSelection, setUnAssignRowSelection] = useState<Record<string, boolean>>({});
    const [unAssignTestCaseIds, setUnAssignTestCaseIds] = useState<string[]>([]);
    const [assignTestCases, setAssignTestCases] = useState<ITestCase[]>([]);
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [assignIsViewLoading, setAssignIsViewLoading] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>("");
    const [testCases, setTestCases] = useState<ITestCase[]>([]);
    const [testCaseIds, setTestCaseIds] = useState<string[]>([]);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [unassignedLoading, setUnAssignedLoading] = useState<boolean>(false);
    const [multipleUnassignedLoading, setMultipleUnAssignedLoading] = useState<boolean>(false);
    const [assignedLoading, setAssignedLoading] = useState<boolean>(false);
    const [multipleAssignedLoading, setMultipleAssignedLoading] = useState<boolean>(false);
    const [loadingRowIdUnAssign, setLoadingRowIdUnAssign] = useState<string | null>(null);
    const [assignedPageIndex, setAssignedPageIndex] = useState<number>(1);
    const [assignedPageSize, setAssignedPageSize] = useState(PAGINATION_LIMIT);
    const [totalAssignedPageCount, setTotalAssignedPageCount] = useState(0);
    const [loadingRowIdAssign, setLoadingRowIdAssign] = useState<string | null>(null);
    const [pageIndex, setPageIndex] = useState<number>(1);
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const { projectId } = useParams<{ projectId: string }>();

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

    const handleAssignedPreviousPage = () => {
        if (assignedPageIndex > 1) {
            setAssignedPageIndex(assignedPageIndex - 1);
        }
    };

    const handleAssignedNextPage = () => {
        if (assignedPageIndex < Math.ceil(totalAssignedPageCount / assignedPageSize)) {
            setAssignedPageIndex(assignedPageIndex + 1);
        }
    };


    const refreshTestCases = () => {
        getAlltestCases();
        setRowSelection({});
        setUnAssignRowSelection({});
        getAssigntestCases();
    };

    const assignTestCaseInTestCycle = async () => {
        setMultipleAssignedLoading(true);
        try {
            const response = await assignTestCase(projectId, testCycleId, { testCaseIds: testCaseIds })
            if (response) {
                toasterService.success(response.message);
                refreshTestCases();
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setMultipleAssignedLoading(false);
        }
    }

    const unAssignTestCaseInTestCycle = async () => {
        setMultipleUnAssignedLoading(true);
        try {
            const response = await unAssignTestCase(projectId, testCycleId, { testCaseIds: unAssignTestCaseIds, isSingleDelete: false, testCases: unAssignTestCaseIds })
            if (response) {
                refreshTestCases();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setMultipleUnAssignedLoading(false);
        }
    }

    const getAlltestCases = async () => {
        setIsViewLoading(true);
        try {
            const response = await getTestCaseWithoutPaginationService(projectId, testCycleId, assignedPageIndex, assignedPageSize);
            if (response) {
                setTestCases(response?.testCases?.testCases);
                setTotalAssignedPageCount(response?.totalTestCases);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
    }

    const getAssigntestCases = async () => {
        setAssignIsViewLoading(true);
        try {
            const response = await getAssignTestCaseService(projectId, testCycleId, pageIndex, pageSize);
            if (response) {
                setAssignTestCases(response?.testCycle?.testCases || []);
                setTotalPageCount(response?.totalTestCases);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setAssignIsViewLoading(false);
        }
    }

    const table = useReactTable({
        data: assignTestCases,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setUnAssignRowSelection,
        globalFilterFn: "includesString",
        state: {
            sorting,
            globalFilter,
            columnVisibility,
            rowSelection: unAssignrowSelection,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    const assignTestCaseTable = useReactTable({
        data: testCases,
        columns: assignTestCaseColumns,
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

    // Single unassign
    const singleUnAssign = async (id: string) => {
        setUnAssignedLoading(true);
        try {
            setLoadingRowIdUnAssign(id);
            const response = await unAssignTestCase(projectId, testCycleId, { testCaseIds: [id], isSingleDelete: true })
            if (response) {
                refreshTestCases();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setUnAssignedLoading(false);
        }
    }

    // Single assign
    const singleAssign = async (id: string) => {
        setAssignedLoading(true);
        try {
            setLoadingRowIdAssign(id);
            const assignTestCaseIds = assignTestCases?.map((assignTestCase) => assignTestCase?._id).filter((id): id is string => id !== undefined) || [];
            const totalAssignTestCaseId = [...assignTestCaseIds, id];
            const response = await assignTestCase(projectId, testCycleId, { testCaseIds: totalAssignTestCaseId })
            if (response) {
                toasterService.success(response.message);
                refreshTestCases();
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setAssignedLoading(false);
        }
    }

    useEffect(() => {
        if (sheetOpen) {
            setPageIndex(1);
            setAssignedPageIndex(1);
            setActiveTab("un-assigned");
        }
    }, [sheetOpen]);

    useEffect(() => {
        getAlltestCases();
    }, [sheetOpen, assignedPageIndex, assignedPageSize]);

    useEffect(() => {
        getAssigntestCases();
    }, [sheetOpen, pageIndex, pageSize]);

    useEffect(() => {
        const selectedIds = Object.keys(rowSelection)
            .filter((key) => rowSelection[key])
            .map((key) => testCases[parseInt(key)]?._id)
            .filter((id): id is string => id !== undefined);
        const assignTestCaseIds = assignTestCases?.map((assignTestCase) => assignTestCase?._id) || [];
        const allTestCaseIds = [...assignTestCaseIds, ...selectedIds];
        setTestCaseIds(allTestCaseIds as string[]);
    }, [rowSelection, testCases]);

    useEffect(() => {
        const selectedIds = Object.keys(unAssignrowSelection)
            .filter((key) => unAssignrowSelection[key])
            .map((key) => {
                const index = parseInt(key, 10);
                const testCase = assignTestCases?.[index]?._id;
                return testCase;
            })
            .filter((_id, index, self) => _id !== undefined && self.indexOf(_id) === index);

        if (selectedIds.length > 0) {
            setUnAssignTestCaseIds(selectedIds as string[]);
        }
    }, [unAssignrowSelection, assignTestCases]);

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-left font-medium">
                        <span className="text-primary">{row?.original?.customId}:</span>
                        <span className="ml-2 capitalize">{row?.original?.title}</span>
                    </SheetTitle>

                </SheetHeader>
                <Tabs defaultValue="un-assigned" value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList>
                        <TabsTrigger value="un-assigned">Unassigned</TabsTrigger>
                        <TabsTrigger value="assigned" >Assigned</TabsTrigger>
                    </TabsList>
                    <TabsContent value="un-assigned">
                        <div className="w-full">
                            <div className="flex mb-3">
                                <div>Unassigned test cases</div>
                            </div>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        {assignTestCaseTable.getHeaderGroups().map((headerGroup) => (
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
                                        {assignTestCaseTable && assignTestCaseTable.getRowModel() && assignTestCaseTable?.getRowModel()?.rows?.length ? (
                                            assignTestCaseTable.getRowModel().rows.map((row) => (
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
                                                    {isViewLoading ? "Loading" : "No result"}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex justify-end mt-4">
                                {Object.keys(rowSelection).length > 0 && (
                                    <>
                                        <Button type="button" className="bg-destructive hover:bg-destructive mr-4"
                                            onClick={() => setRowSelection({})}>
                                            Cancel
                                        </Button>
                                        <Button type="button" onClick={assignTestCaseInTestCycle}>
                                            {multipleAssignedLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
                                            {multipleAssignedLoading ? "Assigning" : "Assign"}
                                        </Button>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAssignedPreviousPage}
                                        disabled={assignedPageIndex === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAssignedNextPage}
                                        disabled={assignedPageIndex >= Math.ceil(totalAssignedPageCount / assignedPageSize)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="assigned">
                        <main className="mt-3">
                            <div className="w-full mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div>Assigned test cases</div>
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
                                            {table && table?.getRowModel() && table?.getRowModel()?.rows?.length ? (
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
                                                        {assignIsViewLoading ? "Loading" : "No results"}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex justify-end mt-4">
                                    {Object.keys(unAssignrowSelection).length > 0 && (
                                        <>
                                            <Button type="button" className="bg-destructive hover:bg-destructive mr-4"
                                                onClick={() => setUnAssignRowSelection({})}>
                                                Cancel
                                            </Button>
                                            <Button type="button" onClick={unAssignTestCaseInTestCycle}>
                                                {multipleUnassignedLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
                                                {multipleUnassignedLoading ? "Un Assigning" : "Unassign"}
                                            </Button>
                                        </>
                                    )}
                                </div>
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
                        </main>
                    </TabsContent>
                </Tabs>

            </SheetContent>
        </Sheet>
    );
}

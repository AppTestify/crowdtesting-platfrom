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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import toasterService from "@/app/_services/toaster-service";
import { getTestCaseWithoutPaginationService } from "@/app/_services/test-case.service";
import { ITestCycle } from "@/app/_interface/test-cycle";
import { assignTestCase, getAssignTestCaseService, unAssignTestCase } from "@/app/_services/test-cycle.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileInput, FileOutput, Loader2 } from "lucide-react";

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
            accessorKey: "expectedResult",
            header: "Expected result",
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("expectedResult")}</div>
            ),
        },
        {
            id: "assign",
            header: "",
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" onClick={() => singleUnAssign(row.original.id)} >
                    {unassignedLoading && loadingRowIdUnAssign === row.original.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileOutput />}
                </Button>
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
            accessorKey: "expectedResult",
            header: "Expected result",
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("expectedResult")}</div>
            ),
        },
        {
            id: "assign",
            header: "",
            cell: ({ row }) => (
                <Button variant="ghost" size="sm" onClick={() => singleAssign(row.original.id)} >
                    {assignedLoading && loadingRowIdAssign === row.original.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileInput />}
                </Button>
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ];

    const testCycleId = row.original?.id;
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [unAssignrowSelection, setUnAssignRowSelection] = useState<Record<string, boolean>>({});
    const [unAssignTestCaseIds, setUnAssignTestCaseIds] = useState<string[]>([]);
    const [assignTestCases, setAssignTestCases] = useState<ITestCase[]>([]);
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [assignIsViewLoading, setAssignIsViewLoading] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>("un-assigned");
    const [testCases, setTestCases] = useState<ITestCase[]>([]);
    const [testCaseIds, setTestCaseIds] = useState<string[]>([]);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [unassignedLoading, setUnAssignedLoading] = useState<boolean>(false);
    const [assignedLoading, setAssignedLoading] = useState<boolean>(false);
    const [loadingRowIdUnAssign, setLoadingRowIdUnAssign] = useState<string | null>(null);
    const [loadingRowIdAssign, setLoadingRowIdAssign] = useState<string | null>(null);
    const { projectId } = useParams<{ projectId: string }>();

    const refreshTestCases = () => {
        getAlltestCases();
        setRowSelection({});
        setUnAssignRowSelection({});
        getAssigntestCases();
    };

    const assignTestCaseInTestCycle = async () => {
        setAssignedLoading(true);
        try {
            const response = await assignTestCase(projectId, testCycleId, { testCaseIds: testCaseIds })
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

    const unAssignTestCaseInTestCycle = async () => {
        setUnAssignedLoading(true);
        try {
            const response = await unAssignTestCase(projectId, testCycleId, { testCaseIds: unAssignTestCaseIds })
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

    const getAlltestCases = async () => {
        setIsViewLoading(true);
        try {
            const response = await getTestCaseWithoutPaginationService(projectId, testCycleId);
            if (response) {
                setTestCases(response);
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
            const response = await getAssignTestCaseService(projectId, testCycleId);
            if (response) {
                setAssignTestCases(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setAssignIsViewLoading(false);
        }
    }

    const table = useReactTable({
        data: assignTestCases as ITestCase[],
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
            const response = await unAssignTestCase(projectId, testCycleId, { testCaseIds: [id] })
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
            const assignTestCaseIds = assignTestCases?.map((assignTestCase) => assignTestCase.id) || [];
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
            getAlltestCases();
            getAssigntestCases();
            setActiveTab("un-assigned");
        }
    }, [sheetOpen]);

    useEffect(() => {
        const selectedIds = Object.keys(rowSelection)
            .filter((key) => rowSelection[key])
            .map((key) => testCases[parseInt(key)]?.id)
            .filter((id): id is string => id !== undefined);
        const assignTestCaseIds = assignTestCases?.map((assignTestCase) => assignTestCase.id) || [];
        const allTestCaseIds = [...assignTestCaseIds, ...selectedIds];
        setTestCaseIds(allTestCaseIds);
    }, [rowSelection, testCases]);

    useEffect(() => {
        const selectedIds = Object.keys(unAssignrowSelection)
            .filter((key) => unAssignrowSelection[key])
            .map((key) => assignTestCases?.[parseInt(key)]?.id)
            .filter((id): id is string => id !== undefined);
        if (selectedIds.length > 0) {
            setUnAssignTestCaseIds(selectedIds);
        }
    }, [unAssignrowSelection, assignTestCases]);

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-left">Assign test cases</SheetTitle>
                    <SheetDescription className="text-left">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae laboriosam quas
                        cum expedita quidem sit qui quaerat, ipsa animi nobis
                    </SheetDescription>
                </SheetHeader>
                <Tabs defaultValue="un-assigned" value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList>
                        <TabsTrigger value="un-assigned" >Unassigned</TabsTrigger>
                        <TabsTrigger value="assigned">Assigned</TabsTrigger>
                    </TabsList>
                    <TabsContent value="un-assigned">
                        <main className="mt-3">
                            <div className="w-full mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div>Un assigned test cases</div>
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
                                                {unassignedLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
                                                {unassignedLoading ? "Un Assigning" : "Unassign"}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </main>
                    </TabsContent>
                    <TabsContent value="assigned">
                        <div className="w-full">
                            <div className="flex items-center justify-between mb-3">
                                <div>Assigned test cases</div>
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
                                            {assignedLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
                                            {assignedLoading ? "Assigning" : "Assign"}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

            </SheetContent>
        </Sheet>
    );
}

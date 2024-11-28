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
import { ITestCase, ITestCasePayload } from "@/app/_interface/test-case";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import toasterService from "@/app/_services/toaster-service";
import { getTestCaseWithoutPaginationService } from "@/app/_services/test-case.service";
import { ITestCycle } from "@/app/_interface/test-cycle";
import { assignTestCase } from "@/app/_services/test-cycle.service";

export default function AssignTestCase({ sheetOpen, setSheetOpen, row, refreshTestCycle }:
    {
        sheetOpen: boolean;
        setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
        row: Row<ITestCycle>;
        refreshTestCycle: () => void;
    }
) {

    const columns: ColumnDef<ITestCase>[] = [
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
    ];

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
    ];
    // getTestCaseWithoutPaginationService
    const testCycleId = row.original?.id;
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [testCases, setTestCases] = useState<ITestCase[]>([]);
    const [testCaseIds, setTestCaseIds] = useState<string[]>([]);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const { projectId } = useParams<{ projectId: string }>();

    const refreshTestCases = () => {
        // getTestCases();
        setRowSelection({});
    };

    const assignTestCaseInTestCycle = async () => {
        try {
            const response = await assignTestCase(projectId, testCycleId, { testCaseIds: testCaseIds })
            if (response) {
                refreshTestCycle();
                closeDialog();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            // console.log("error", error)

        }
    }

    const getAlltestCases = async () => {
        try {
            const response = await getTestCaseWithoutPaginationService(projectId);
            if (response) {
                setTestCases(response);
            }
        } catch (error) {
            toasterService.error();
        }
    }

    useEffect(() => {
        if (isOpen) {
            getAlltestCases();
        }
    }, [isOpen]);

    const table = useReactTable({
        data: row?.original?.testCaseId as ITestCase[],
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        globalFilterFn: "includesString",
        state: {
            sorting,
            globalFilter,
            columnVisibility,
            rowSelection,
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

    useEffect(() => {
        const selectedIds = Object.keys(rowSelection)
            .filter((key) => rowSelection[key])
            .map((key) => testCases[parseInt(key)].id);
        setTestCaseIds(selectedIds);
    }, [rowSelection, testCases]);

    const closeDialog = () => { setIsOpen(false); }

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <Dialog open={isOpen} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Assign test cases</DialogTitle>
                    </DialogHeader>
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
                                            No results
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="submit" onClick={() => assignTestCaseInTestCycle()}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {isLoading ? "Adding" : "Add"}
                        </Button>
                        <Button onClick={closeDialog} type="button" className="bg-destructive hover:bg-destructive">
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-left">Assign test cases</SheetTitle>
                    <SheetDescription className="text-left">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae laboriosam quas
                        cum expedita quidem sit qui quaerat, ipsa animi nobis
                    </SheetDescription>
                </SheetHeader>
                <div>
                    <div className="flex py-4 justify-start">
                        <Button type="button" onClick={() => setIsOpen(true)}>
                            <Plus />    Assign test cases
                        </Button>
                    </div>
                </div>
                <main className="mt-2">
                    <div className="w-full">
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
                                                No results
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </main>
            </SheetContent>
        </Sheet>
    );
}

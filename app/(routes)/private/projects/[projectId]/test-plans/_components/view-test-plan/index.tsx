import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet"
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ITestPlan, ITestPlanParameter } from "@/app/_interface/test-plan";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { useState } from "react";

const ViewTestPlan = ({
    testPlan,
    sheetOpen,
    setSheetOpen,
}: {
    testPlan: ITestPlan;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const columns: ColumnDef<ITestPlanParameter>[] = [
        {
            accessorKey: "parameter",
            header: "Parameter",
            cell: ({ row }) => <div>{row.getValue("parameter")}</div>,
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => <div>{row.getValue("description")}</div>,
        },
    ];

    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({
            parameter: false,
            description: false,
        });

    const table = useReactTable({
        data: testPlan?.parameters || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        globalFilterFn: "includesString",
    });

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px]">
                <SheetHeader className="mb-4">
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-md capitalize">{testPlan?.title}</p>
                    </div>
                </SheetHeader>
                <DropdownMenuSeparator className="border-b" />
                <div className="mt-3">
                    Parameters
                    <div className="mt-3">
                        {table.getRowModel().rows?.length ? (
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
                                        {table.getRowModel().rows.map((row) => (
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
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results
                                </TableCell>
                            </TableRow>
                        )
                        }
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default ViewTestPlan;

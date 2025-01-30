"use client";

import React, { useEffect, useState } from "react";

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
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useMediaQuery } from "react-responsive";
import { MOBILE_BREAKPOINT } from "@/app/_constants/media-queries";
import { IDevice } from "@/app/_interface/device";

export default function ViewDevice({ devices }: { devices: IDevice[] }) {
    const columns: ColumnDef<IDevice>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div>
                    {row.getValue('name')}
                </div>
            ),
        },
        {
            accessorKey: "os",
            header: "OS",
            cell: ({ row }) => (
                <div>
                    {row.getValue('os')}
                </div>
            ),
        },
        {
            accessorKey: "version",
            header: "Version",
            cell: ({ row }) => (
                <div>
                    {row.getValue('version')}
                </div>
            ),
        },
    ];

    const isMobile = useMediaQuery({ query: MOBILE_BREAKPOINT });
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({
            id: false,
            data: false,
            contentType: false,
            name: true,
            fileType: !isMobile,
        });
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState<any>([]);
    const table = useReactTable({
        data: devices,
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


    return (
        <>
            <main className="mt-2">
                <div>
                    <h2 className={`font-semibold`}>Devices</h2>
                </div>
                <div className="w-full mt-1">
                    <div className="rounded-md border">
                        <Table>
                            <TableBody>
                                {/* Check if rows are defined and have content */}
                                {table?.getRowModel()?.rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            No data available
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                    </div>
                </div>
            </main>
        </>
    );
}

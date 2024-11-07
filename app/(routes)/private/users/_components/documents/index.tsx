"use client";

import React, { useEffect, useState } from "react";

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Download, Trash, Upload } from "lucide-react";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { IDocument, IUserDocument } from "@/app/_interface/document";
import { DocumentName } from "@/app/_components/document-name";
import { useMediaQuery } from "react-responsive";
import { MOBILE_BREAKPOINT } from "@/app/_constants/media-queries";
import { FileType } from "../../../profile/_components/tester-profile/_components/documents/_components/file-type";
import { Button } from "@/components/ui/button";
import { downloadDocument } from "@/app/_utils/common";
import toasterService from "@/app/_services/toaster-service";

export default function UserDocuments({ documents = [] }: { documents?: IUserDocument[] }) {
    const columns: ColumnDef<IUserDocument>[] = [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => <div>{row.getValue("id")}</div>,
        },
        {
            accessorKey: "data",
            header: "File data",
            cell: ({ row }) => <div>{row.getValue("data")}</div>,
        },
        {
            accessorKey: "contentType",
            header: "contentType",
            cell: ({ row }) => <div>{row.getValue("contentType")}</div>,
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div>
                    <DocumentName document={row} />
                </div>
            ),
        },
        {
            accessorKey: "fileType",
            header: "Type",
            cell: ({ row }) => (
                <div>
                    <FileType document={row} />
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const getFile = async () => {
                    try {
                        downloadDocument(
                            row.getValue("contentType"),
                            row.getValue("data"),
                            row.getValue("name")
                        );
                    } catch (error) {
                        toasterService.error();
                        console.log("Error > getFile", error);
                    }
                };

                return (<div className="flex justify-end pr-4">
                    <Button variant="ghost" size="icon" onClick={() => getFile()}>
                        <Download className="h-4 w-4" />
                    </Button>
                </div>)
            },
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
        data: documents || [],
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

            <main className="mt-4">
                <div>
                    <h2 className="text-lg">Personal Documents</h2>
                </div>
                <div className="w-full">
                    <div className="rounded-md border mt-4">
                        {documents.length === 0 ? (
                            <p className="text-center py-4">No Documents found</p>
                        ) : (
                            <Table>
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
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}

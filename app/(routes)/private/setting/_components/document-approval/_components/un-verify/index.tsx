"use client";

import { FileType } from '@/app/(routes)/private/profile/_components/tester-profile/_components/documents/_components/file-type';
import { DocumentName } from '@/app/_components/document-name';
import { IDocument } from '@/app/_interface/document';
import { getApprovalFilesService } from '@/app/_services/file.service';
import toasterService from '@/app/_services/toaster-service';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Row, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';
import React, { useEffect, useState } from 'react'
import VerifyRowActions from '../verify-row-actions';
import UnVerifyRowActions from '../un-verify-row-actions';

export default function UnVerifyDocument() {
    const [documents, setDocuments] = useState<IDocument[]>([]);

    const columns: ColumnDef<IDocument>[] = [
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
            accessorKey: "name",
            header: "file",
            cell: ({ row }) => (
                <div>
                    <DocumentName document={row} />
                </div>
            ),
        },
        {
            accessorKey: "fileType",
            header: "File Type",
            cell: ({ row }) => (
                <div>
                    <FileType document={row} />
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <UnVerifyRowActions row={row as Row<IDocument>} refreshDocuments={refreshDocuments} />
            ),
        },
    ];

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const table = useReactTable({
        data: documents,
        columns,
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


    const verifyDocument = async () => {
        setIsLoading(true);
        try {
            const response = await getApprovalFilesService(true);
            if (response) {
                setDocuments(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    const refreshDocuments = () => {
        verifyDocument();
    }

    useEffect(() => {
        verifyDocument();
    }, []);

    return (
        <div className='w-full mt-4'>
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
                    {table.getRowModel().rows?.length ? (
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
    )
}

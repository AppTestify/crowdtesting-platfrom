"use client";

import { FileType } from '@/app/(routes)/private/profile/_components/tester-profile/_components/documents/_components/file-type';
import { DocumentName } from '@/app/_components/document-name';
import { IDocument } from '@/app/_interface/document';
import { getApprovalFilesService } from '@/app/_services/file.service';
import toasterService from '@/app/_services/toaster-service';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Row, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';
import React, { useEffect, useState } from 'react'
import NonVerifiedRowActions from '../non-verified-row-actions';
import { IUserByAdmin } from '@/app/_interface/user';
import ViewTesterIssue from '../../../users/_components/view-user';
import { DocumentBulkNonVerified } from '../bulk-non-verify';
import { PAGINATION_LIMIT } from '@/app/_constants/pagination-limit';
import { Button } from '@/components/ui/button';

export default function NonVerifiedDocument() {
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
            header: "File Name",
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
            accessorKey: "verifiedBy",
            header: "Verified By",
            cell: ({ row }) => (
                <div className='hover:text-primary cursor-pointer'
                    onClick={() => getUser(row.original?.verifyBy as IUserByAdmin)}
                >
                    {row.original?.verifyBy?.firstName} {row.original?.verifyBy?.lastName}
                </div>
            ),
        },
        {
            accessorKey: "createdBy",
            header: "Created By",
            cell: ({ row }) => (
                <div className='hover:text-primary cursor-pointer'
                    onClick={() => getUser(row.original?.userId as IUserByAdmin)}
                >
                    {row.original?.userId?.firstName} {row.original?.userId?.lastName}
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <NonVerifiedRowActions row={row as Row<IDocument>} refreshDocuments={refreshDocuments} />
            ),
        },
    ];

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [user, setUser] = useState<IUserByAdmin>();
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [pageIndex, setPageIndex] = useState<number>(() => {
        return Number(localStorage.getItem("currentPage")) || 1;
    });
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);

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
            // globalFilter,
            columnVisibility,
            rowSelection,
        },
        onGlobalFilterChange: setGlobalFilter,
    });


    const verifyDocument = async () => {
        setIsLoading(true);
        try {
            const response = await getApprovalFilesService(true, pageIndex, pageSize, globalFilter as unknown as string);
            if (response) {
                setDocuments(response.documents);
                setRowSelection({});
                setTotalPageCount(response?.total);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    const getSelectedRows = () => {
        return table.getFilteredSelectedRowModel().rows.map((row) => row.original?.id)
            .filter((id): id is string => id !== undefined);
    };

    const refreshDocuments = () => {
        verifyDocument();
    }

    useEffect(() => {
        const debounceFetch = setTimeout(() => {
            verifyDocument();
        }, 500);
        return () => clearTimeout(debounceFetch);
    }, [globalFilter, pageIndex, pageSize]);

    const getUser = async (data: IUserByAdmin) => {
        setUser(data as IUserByAdmin);
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
        <div className='w-full mt-4'>
            <ViewTesterIssue
                user={user as IUserByAdmin}
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
            />
            <div className="flex items-center py-4 justify-between">
                <Input
                    placeholder="Filter documents"
                    value={(globalFilter as string) ?? ""}
                    onChange={(event) => {
                        table.setGlobalFilter(String(event.target.value));
                    }}
                    className="max-w-sm"
                />
                <div className="flex gap-2 ml-2">
                    {getSelectedRows().length ? (
                        <DocumentBulkNonVerified
                            ids={getSelectedRows()}
                            refreshDocuments={refreshDocuments}
                        />
                    ) : null}
                </div>
            </div>
            <div className="rounded-md border w-full">
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
    )
}

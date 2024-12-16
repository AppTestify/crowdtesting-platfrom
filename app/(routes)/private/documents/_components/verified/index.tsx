"use client";

import { FileType } from '@/app/(routes)/private/profile/_components/tester-profile/_components/documents/_components/file-type';
import { DocumentName } from '@/app/_components/document-name';
import { IDocument } from '@/app/_interface/document';
import { getApprovalFilesService, verifyFilesService } from '@/app/_services/file.service';
import toasterService from '@/app/_services/toaster-service';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Row, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';
import React, { useEffect, useState } from 'react'
import VerifiedRowActions from '../verified-row-actions';
import { useSearchParams } from 'next/navigation';
import ViewTesterIssue from '../../../users/_components/view-user';
import { IUserByAdmin } from '@/app/_interface/user';

export default function VerifiedDocuments() {
    const [documents, setDocuments] = useState<IDocument[]>([]);
    const [userData, setUserData] = useState<IUserByAdmin>();
    const searchParams = useSearchParams();
    const [isViewOpen, setIsViewOpen] = useState(false);
    const user = searchParams.get('user');

    // const verifyMultipleDocuments = async () => {
    //     try {
    //         // const response = await verifyFilesService();
    //     } catch (error) {
    //         toasterService.error();
    //     }
    // }

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
            accessorKey: "createdBy",
            header: "Created By",
            cell: ({ row }) => (
                <div className='hover:text-primary cursor-pointer'
                    onClick={() => getUser(row.original?.userId as IUserByAdmin)}
                >
                    {row.original?.userId?.firstName} {row.original?.userId?.lastName}
                </div >
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <VerifiedRowActions row={row as Row<IDocument>} refreshDocuments={refreshDocuments} />
            ),
        },
    ];

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
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
            const response = await getApprovalFilesService(false);
            if (response) {
                // if (user) {
                //     const filterDocuments = response.filter((document: any) => {
                //         return document.userId?._id === user
                //     });
                //     setDocuments(filterDocuments)
                // } else {
                // }
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

    const getUser = async (data: IUserByAdmin) => {
        setUserData(data as IUserByAdmin);
        setIsViewOpen(true);
    };


    return (
        <div className='mt-4 '>
            <ViewTesterIssue
                user={userData as IUserByAdmin}
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
                {/* {userData?.role != UserRoles.CLIENT &&
                    <div className="flex gap-2 ml-2">
                        {getSelectedRows().length ? (
                            <BulkDelete
                                ids={getSelectedRows()}
                                refreshDevices={refreshDevices}
                            />
                        ) : null}
                        <AddDevice browsers={browsers} refreshDevices={refreshDevices} />
                    </div>
                } */}
            </div>
            <div className="rounded-md border w-full">
                <Table className=''>
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
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>

                {/* <div className="flex space-x-2">
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
                </div> */}
            </div>
        </div>
    )
}

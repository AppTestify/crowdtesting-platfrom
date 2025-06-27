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
import { UserRoles } from '@/app/_constants/user-roles';
import { DocumentBulkVeified } from '../bulk-verify';
import { PAGINATION_LIMIT } from '@/app/_constants/pagination-limit';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Search, FileText, User, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VerifiedDocuments() {
    const [documents, setDocuments] = useState<IDocument[]>([]);
    const [userData, setUserData] = useState<IUserByAdmin>();
    const searchParams = useSearchParams();
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [pageIndex, setPageIndex] = useState<number>(1);
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
    const user = searchParams.get('user');

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
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 hover:bg-muted/50"
                >
                    <FileText className="mr-2 h-4 w-4" />
                    File Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <DocumentName document={row} />
                </div>
            ),
        },
        {
            accessorKey: "fileType",
            header: "Type",
            cell: ({ row }) => (
                <div className="flex items-center">
                    <FileType document={row} />
                </div>
            ),
        },
        {
            accessorKey: "createdBy",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 hover:bg-muted/50"
                >
                    <User className="mr-2 h-4 w-4" />
                    Created By
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const user = row.original?.userId;
                const firstName = user?.firstName || "";
                const lastName = user?.lastName || "";
                const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
                const displayName = `${firstName} ${lastName}`.trim() || user?.email;

                return (
                    <div 
                        className='flex items-center space-x-2 hover:text-primary cursor-pointer transition-colors'
                        onClick={() => getUser(user as IUserByAdmin)}
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-muted">
                                {initials || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                    </div>
                );
            },
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
        onSortingChange: setSorting,
        globalFilterFn: "includesString",
        state: {
            sorting,
            columnVisibility,
            rowSelection,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    // Responsive column visibility
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            // No responsive column hiding needed for this table
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const verifyDocument = async () => {
        setIsLoading(true);
        try {
            const response = await getApprovalFilesService(false, pageIndex, pageSize, globalFilter as unknown as string);
            if (response) {
                setTotalPageCount(response?.total);
                setRowSelection({});
                setDocuments(response?.documents);
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
        setUserData(data as IUserByAdmin);
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

    const totalPages = Math.ceil(totalPageCount / pageSize);

    return (
        <div className="w-full max-w-full overflow-hidden">
            <ViewTesterIssue
                user={userData as IUserByAdmin}
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
            />
            
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search verified documents..."
                        value={(globalFilter as string) ?? ""}
                        onChange={(event) => {
                            table.setGlobalFilter(String(event.target.value));
                        }}
                        className="pl-9"
                    />
                </div>
                
                {userData?.role != UserRoles.CLIENT && getSelectedRows().length > 0 && (
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                            {getSelectedRows().length} selected
                        </Badge>
                        <DocumentBulkVeified
                            ids={getSelectedRows()}
                            refreshDocuments={refreshDocuments}
                        />
                    </div>
                )}
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-hidden">
                        <Table className="table-fixed">
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead 
                                                    key={header.id}
                                                    className={cn(
                                                        "bg-muted/50 font-semibold text-foreground",
                                                        header.id === "select" && "w-12",
                                                        header.id === "name" && "min-w-[200px]",
                                                        header.id === "fileType" && "w-24",
                                                        header.id === "createdBy" && "min-w-[200px]",
                                                        header.id === "actions" && "w-20"
                                                    )}
                                                >
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
                                {isLoading ? (
                                    // Loading skeleton
                                    [...Array(5)].map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Skeleton className="h-8 w-8 rounded-full" />
                                                    <div className="space-y-1">
                                                        <Skeleton className="h-3 w-24" />
                                                        <Skeleton className="h-3 w-32" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell 
                                                    key={cell.id}
                                                    className="py-3"
                                                >
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
                                            className="h-32 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <FileText className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">No verified documents found</p>
                                                <p className="text-xs text-muted-foreground">Documents will appear here once they are verified</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPageCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {((pageIndex - 1) * pageSize) + 1} to {Math.min(pageIndex * pageSize, totalPageCount)} of {totalPageCount} documents
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={pageIndex === 1}
                            className="gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">
                                Page {pageIndex} of {totalPages}
                            </span>
                        </div>
                        
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={pageIndex >= totalPages}
                            className="gap-2"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

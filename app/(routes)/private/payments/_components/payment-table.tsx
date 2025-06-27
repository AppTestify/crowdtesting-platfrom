"use client";

import React, { useEffect, useState } from 'react';
import { IPayment } from '@/app/_interface/payment';
import { getPaymentsByUserService } from '@/app/_services/payment.service';
import toasterService from '@/app/_services/toaster-service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Row, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';
import { PaymentRowActions } from '../../users/_components/payment/_components/row-actions';
import { paymentStatusBadge } from '@/app/_utils/common-functionality';
import { PaymentCurrency } from '@/app/_constants/payment';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PAGINATION_LIMIT } from '@/app/_constants/pagination-limit';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Search, DollarSign, User, FileText, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentTableProps {
    userId: string;
    isAdmin: boolean;
    refreshStats: () => void;
}

export default function PaymentTable({ userId, isAdmin, refreshStats }: PaymentTableProps) {
    const [payments, setPayments] = useState<IPayment[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);

    const columns: ColumnDef<IPayment>[] = [
        {
            accessorKey: "description",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 hover:bg-muted/50"
                >
                    <FileText className="mr-2 h-4 w-4" />
                    Description
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const description = row.getValue("description") as string;
                return (
                    <div className="flex items-center space-x-2">
                        <div 
                            title={description}
                            className="font-medium truncate max-w-[200px]"
                        >
                            {description || "No description"}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "amount",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 hover:bg-muted/50"
                >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const amount = row.original?.amount as any;
                const currency = row.original?.currency as string;
                const displayAmount = amount?.$numberDecimal ? parseFloat(amount.$numberDecimal) : 0;
                
                return (
                    <div className="flex items-center space-x-1">
                        <Badge variant="outline" className="text-xs font-mono">
                            {currency || PaymentCurrency.USD}
                        </Badge>
                        <span className="font-semibold">
                            {displayAmount.toLocaleString()}
                        </span>
                    </div>
                );
            },
        },
        ...(isAdmin ? [{
            accessorKey: "senderId",
            header: ({ column }: any) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 hover:bg-muted/50"
                >
                    <User className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Sender</span>
                    <span className="sm:hidden">From</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }: { row: any }) => {
                const sender = row.original?.senderId;
                const firstName = sender?.firstName || "";
                const lastName = sender?.lastName || "";
                const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
                const displayName = `${firstName} ${lastName}`.trim() || sender?.email;

                return (
                    <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-muted">
                                {initials || 'S'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{sender?.email}</p>
                        </div>
                    </div>
                );
            },
        }] : []),
        ...(isAdmin ? [{
            accessorKey: "receiverId",
            header: ({ column }: any) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-2 lg:px-3 hover:bg-muted/50"
                >
                    <User className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Receiver</span>
                    <span className="sm:hidden">To</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }: { row: any }) => {
                const receiver = row.original?.receiverId;
                const firstName = receiver?.firstName || "";
                const lastName = receiver?.lastName || "";
                const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
                const displayName = `${firstName} ${lastName}`.trim() || receiver?.email;

                return (
                    <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-muted">
                                {initials || 'R'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{receiver?.email}</p>
                        </div>
                    </div>
                );
            },
        }] : []),
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: { row: any }) => (
                <div className="flex items-center">
                    {paymentStatusBadge(row.original?.status)}
                </div>
            ),
        },
        ...(isAdmin ? [{
            id: "actions",
            enableHiding: false,
            cell: ({ row }: { row: any }) => (
                <PaymentRowActions row={row as Row<IPayment>} refreshPayment={refreshPayments} />
            ),
        }] : []),
    ];

    const table = useReactTable({
        data: payments,
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
            columnVisibility,
            rowSelection,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    // Responsive column visibility
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (isAdmin) {
                setColumnVisibility({
                    senderId: width >= 1024, // Hide on smaller screens
                    receiverId: width >= 768,
                });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isAdmin]);

    const getPayments = async () => {
        setIsLoading(true);
        try {
            const response = await getPaymentsByUserService(userId, pageIndex, pageSize, globalFilter as unknown as string);
            if (response) {
                setPayments(response?.payments);
                setTotalPageCount(response?.total);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    const refreshPayments = () => {
        getPayments();
        refreshStats();
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

    useEffect(() => {
        const debounceFetch = setTimeout(() => {
            getPayments();
        }, 500);
        return () => clearTimeout(debounceFetch);
    }, [pageIndex, pageSize, globalFilter]);

    const totalPages = Math.ceil(totalPageCount / pageSize);

    return (
        <div className="w-full max-w-full overflow-hidden space-y-4">
            {/* Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search payments..."
                        value={(globalFilter as string) ?? ""}
                        onChange={(event) => {
                            table.setGlobalFilter(String(event.target.value));
                        }}
                        className="pl-9"
                    />
                </div>
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
                                                        header.id === "description" && "min-w-[200px]",
                                                        header.id === "amount" && "w-32",
                                                        header.id === "senderId" && "min-w-[180px]",
                                                        header.id === "receiverId" && "min-w-[180px]",
                                                        header.id === "status" && "w-24",
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
                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            {columnVisibility.senderId && (
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Skeleton className="h-8 w-8 rounded-full" />
                                                        <div className="space-y-1">
                                                            <Skeleton className="h-3 w-24" />
                                                            <Skeleton className="h-3 w-32" />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            )}
                                            {columnVisibility.receiverId && (
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Skeleton className="h-8 w-8 rounded-full" />
                                                        <div className="space-y-1">
                                                            <Skeleton className="h-3 w-24" />
                                                            <Skeleton className="h-3 w-32" />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            )}
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            {isAdmin && <TableCell><Skeleton className="h-4 w-8" /></TableCell>}
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
                                                <DollarSign className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">No payments found</p>
                                                <p className="text-xs text-muted-foreground">Payment transactions will appear here</p>
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
                        Showing {((pageIndex - 1) * pageSize) + 1} to {Math.min(pageIndex * pageSize, totalPageCount)} of {totalPageCount} payments
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
    );
} 
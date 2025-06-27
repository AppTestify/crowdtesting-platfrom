"use client";

import { DocumentName } from '@/app/_components/document-name';
import { MOBILE_BREAKPOINT } from '@/app/_constants/media-queries';
import { IInvoice } from '@/app/_interface/invoice';
import {
    ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
    getSortedRowModel, SortingState, useReactTable, VisibilityState
} from '@tanstack/react-table';
import React, { useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive';
import AddInvoice from './_components/add-invoice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Upload, Search, FileText, ArrowUpDown, Clock, User, Activity, Calendar } from 'lucide-react';
import toasterService from '@/app/_services/toaster-service';
import { getInvoiceService } from '@/app/_services/invoice.service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatAttachmentDate } from '@/app/_constants/date-formatter';
import { InvoiceRowActions } from './_components/row-actions';
import { PAGINATION_LIMIT } from '@/app/_constants/pagination-limit';
import { useSession } from 'next-auth/react';
import { UserRoles } from '@/app/_constants/user-roles';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Invoices() {
    const isMobile = useMediaQuery({ query: MOBILE_BREAKPOINT });
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState<boolean>(false);
    const [rowSelection, setRowSelection] = useState({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [invoices, setInvoices] = useState<IInvoice[]>([]);
    const [globalFilter, setGlobalFilter] = useState<any>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [userData, setUserData] = useState<any>();
    const [allInvoices, setAllInvoices] = useState<IInvoice[]>([]);
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    })
    const { data } = useSession();

    const columns: ColumnDef<IInvoice>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                const isSorted = column.getIsSorted();
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                        className="h-8 px-1 hover:bg-muted/80 justify-start"
                    >
                        <FileText className="mr-1 h-3 w-3" />
                        <span className="font-semibold text-xs">Invoice</span>
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                        <DocumentName document={row} />
                    </div>
                </div>
            ),
            size: 250,
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => {
                const isSorted = column.getIsSorted();
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                        className="h-8 px-1 hover:bg-muted/80"
                    >
                        <Clock className="mr-1 h-3 w-3" />
                        <span className="font-semibold text-xs">Uploaded</span>
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs">
                        {formatAttachmentDate(row.original?.createdAt)}
                    </span>
                </div>
            ),
            size: 150,
        },
        ...(userData?.role === UserRoles.ADMIN ? [{
            accessorKey: "createdBy",
            header: ({ column }: { column: any }) => {
                const isSorted = column.getIsSorted();
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                        className="h-8 px-1 hover:bg-muted/80 hidden md:flex"
                    >
                        <User className="mr-1 h-3 w-3" />
                        <span className="font-semibold text-xs">Created By</span>
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }: { row: any }) => {
                const user = row.original.userId;
                const firstName = user?.firstName || "";
                const lastName = user?.lastName || "";
                const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
                const displayName = `${firstName} ${lastName}`.trim();

                return (
                    <div className="items-center space-x-2 hidden md:flex">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                            <AvatarFallback className="text-xs bg-muted">
                                {initials || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs truncate max-w-[120px]">
                            {displayName || 'Unknown User'}
                        </span>
                    </div>
                );
            },
            size: 150,
        }] : []),
        {
            id: "actions",
            header: () => <span className="font-semibold text-xs">Actions</span>,
            cell: ({ row }) => (
                <InvoiceRowActions row={row} refreshDocuments={refreshDocuments} />
            ),
            size: 80,
        },
    ];

    const table = useReactTable({
        data: invoices,
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

    const getInvoice = async () => {
        setIsLoading(true);
        try {
            let formattedFromDate, formattedToDate;
            if (date) {
                formattedFromDate = date?.from ? format(date.from, "yyyy-MM-dd") : "";
                formattedToDate = date?.to ? format(date.to, "yyyy-MM-dd") : "";
            }
            const response = await getInvoiceService(pageIndex, pageSize, globalFilter, formattedFromDate, formattedToDate);
            if (response) {
                setInvoices(response?.invoices);
                setTotalPageCount(response?.total)
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    // Fetch all invoices for dashboard stats
    const getAllInvoices = async () => {
        try {
            let formattedFromDate, formattedToDate;
            if (date) {
                formattedFromDate = date?.from ? format(date.from, "yyyy-MM-dd") : "";
                formattedToDate = date?.to ? format(date.to, "yyyy-MM-dd") : "";
            }
            const response = await getInvoiceService(
                1, // page 1
                999999, // large page size to get all
                globalFilter,
                formattedFromDate,
                formattedToDate
            );
            setAllInvoices(response?.invoices || []);
        } catch (error) {
            setAllInvoices([]);
        }
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

    const refreshDocuments = () => {
        getInvoice();
        getAllInvoices();
    }

    useEffect(() => {
        const debounceFetch = setTimeout(() => {
            getInvoice();
            getAllInvoices();
        }, 500);
        return () => clearTimeout(debounceFetch);
    }, [pageIndex, pageSize, globalFilter, date]);

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    useEffect(() => {
        getAllInvoices();
    }, []);

    // Calculate statistics from allInvoices
    const recentInvoices = allInvoices.filter(invoice => {
        if (!invoice.createdAt) return false;
        const created = new Date(invoice.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return created > thirtyDaysAgo;
    }).length;

    const todayInvoices = allInvoices.filter(invoice => {
        if (!invoice.createdAt) return false;
        const created = new Date(invoice.createdAt);
        const today = new Date();
        return created.toDateString() === today.toDateString();
    }).length;

    return (
        <div className="w-full max-w-full overflow-hidden">
            <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
                <AddInvoice
                    isOpen={isAddInvoiceOpen}
                    setIsOpen={setIsAddInvoiceOpen}
                    refreshDocuments={refreshDocuments}
                />

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
                            Invoices
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manage and track your invoice documents
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        {userData?.role !== UserRoles.CLIENT && (
                            <Button
                                onClick={() => setIsAddInvoiceOpen(true)}
                                className="gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                Upload Invoice
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total Invoices</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{totalPageCount}</div>
                            <p className="text-xs text-muted-foreground">All documents</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Today</CardTitle>
                            <Activity className="h-4 w-4 text-green-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-green-600">{todayInvoices}</div>
                            <p className="text-xs text-muted-foreground">Uploaded today</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">This Month</CardTitle>
                            <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-blue-600">{recentInvoices}</div>
                            <p className="text-xs text-muted-foreground">Last 30 days</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">This Week</CardTitle>
                            <FileText className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-purple-600">
                                {allInvoices.filter(invoice => {
                                    if (!invoice.createdAt) return false;
                                    const created = new Date(invoice.createdAt);
                                    const sevenDaysAgo = new Date();
                                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                                    return created > sevenDaysAgo;
                                }).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Last 7 days</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
                            <div className="flex-1 relative min-w-0">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search invoices by name..."
                                    value={(globalFilter as string) ?? ""}
                                    onChange={(event) => {
                                        table.setGlobalFilter(String(event.target.value));
                                    }}
                                    className="pl-9 h-10 w-full"
                                />
                            </div>
                            <div className="flex-shrink-0">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                                "w-[200px] sm:w-[270px] justify-start text-left font-normal h-10",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date?.from ? (
                                                date.to ? (
                                                    <>
                                                        {format(date.from, "MMM dd")} - {format(date.to, "MMM dd, y")}
                                                    </>
                                                ) : (
                                                    format(date.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Filter by date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            initialFocus
                                            mode="range"
                                            selected={date}
                                            onSelect={setDate}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="w-full">
                            <Table className="w-full table-fixed">
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id} className="border-b bg-muted/50">
                                            {headerGroup.headers.map((header) => {
                                                return (
                                                    <TableHead key={header.id} className="h-12 px-1 sm:px-2 whitespace-nowrap overflow-hidden">
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
                                                className="hover:bg-muted/50 transition-colors border-b last:border-b-0"
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id} className="px-1 sm:px-2 py-3 whitespace-nowrap overflow-hidden">
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
                                                    {isLoading ? (
                                                        <>
                                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
                                                            <p className="text-sm text-muted-foreground">Loading invoices...</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                                            <p className="text-sm text-muted-foreground">No invoices found</p>
                                                            <p className="text-xs text-muted-foreground">Try adjusting your search or upload new invoices</p>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t bg-muted/25 gap-4">
                            <div className="text-sm text-muted-foreground order-2 sm:order-1">
                                Showing {invoices.length} of {totalPageCount} invoices
                            </div>
                            <div className="flex items-center space-x-2 order-1 sm:order-2">
                                <p className="text-sm text-muted-foreground whitespace-nowrap">
                                    Page {pageIndex} of {Math.ceil(totalPageCount / pageSize)}
                                </p>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePreviousPage}
                                        disabled={pageIndex === 1}
                                        className="h-8 px-3"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNextPage}
                                        disabled={pageIndex >= Math.ceil(totalPageCount / pageSize)}
                                        className="h-8 px-3"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

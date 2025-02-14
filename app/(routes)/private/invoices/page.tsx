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
import { CalendarIcon, Upload } from 'lucide-react';
import toasterService from '@/app/_services/toaster-service';
import { getInvoiceService } from '@/app/_services/invoice.service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatAttachmentDate } from '@/app/_constants/date-formatter';
import { InvoiceRowActions } from './_components/row-actions';
import { PAGINATION_LIMIT } from '@/app/_constants/pagination-limit';
import { useSession } from 'next-auth/react';
import { UserRoles } from '@/app/_constants/user-roles';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MONTHS_LIST, SEVERITY_LIST } from '@/app/_constants/issue';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { addDays, format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';

export default function Invoices() {
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
    const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState<boolean>(false);
    const [rowSelection, setRowSelection] = useState({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [invoices, setInvoices] = useState<IInvoice[]>([]);
    const [globalFilter, setGlobalFilter] = useState<any>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [userData, setUserData] = useState<any>();
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    })
    const { data } = useSession();


    const columns: ColumnDef<IInvoice>[] = [
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
            accessorKey: "createdAt",
            header: "Uploaded at",
            cell: ({ row }) => (
                <div>
                    {formatAttachmentDate(row.original?.createdAt)}
                </div>
            ),
        },
        ...(userData?.role === UserRoles.ADMIN ? [{
            accessorKey: "createdBy",
            header: "Created By",
            cell: ({ row }: { row: any }) => (
                <div>
                    {row.original.userId.firstName || ""} {row.original.userId.lastName || ""}
                </div>
            ),
        }] : []),
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <InvoiceRowActions row={row} refreshDocuments={refreshDocuments} />
            ),
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
    }

    useEffect(() => {
        const debounceFetch = setTimeout(() => {
            getInvoice();
        }, 500);
        return () => clearTimeout(debounceFetch);
    }, [pageIndex, pageSize, globalFilter, date]);

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    return (
        <div className='mx-4 mt-4'>
            <AddInvoice
                isOpen={isAddInvoiceOpen}
                setIsOpen={setIsAddInvoiceOpen}
                refreshDocuments={refreshDocuments}
            />
            <main className="mt-4">
                <div>
                    <h2 className={`text-lg`}>Invoices</h2>
                </div>
                <div className="w-full">
                    <div className="flex py-4 w-full justify-between">
                        <Input
                            placeholder="Filter invoices"
                            value={(globalFilter as string) ?? ""}
                            onChange={(event) => {
                                table.setGlobalFilter(String(event.target.value));
                            }}
                            className="max-w-sm"
                        />

                        <div className={cn("grid gap-2 ml-2")}>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        className={cn(
                                            "w-[270px] justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon />
                                        {date?.from ? (
                                            date.to ? (
                                                <>
                                                    {format(date.from, "LLL dd, y")} -{" "}
                                                    {format(date.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(date.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Search by date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex items-end justify-end gap-2 ml-auto">
                            <Button
                                className="ml-2"
                                onClick={() => setIsAddInvoiceOpen(true)}
                            >
                                <Upload /> Upload document
                            </Button>
                        </div>
                    </div>
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
                                            {!isLoading ? "No invoices found" : "Loading"}
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
            </main>
        </div>
    )
}

import { IPayment } from '@/app/_interface/payment';
import { getPaymentsByUserService } from '@/app/_services/payment.service';
import toasterService from '@/app/_services/toaster-service'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
    getSortedRowModel, Row, SortingState, useReactTable, VisibilityState
} from '@tanstack/react-table';
import React, { useEffect, useState } from 'react'
import AddPayment from './_components/add-payment';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PaymentRowActions } from './_components/row-actions';
import { paymentStatusBadge } from '@/app/_utils/common-functionality';
import { PaymentCurrency } from '@/app/_constants/payment';
import { Input } from '@/components/ui/input';
import { PAGINATION_LIMIT } from '@/app/_constants/pagination-limit';

export default function Payment({ userId, isTester = false }: { userId: string, isTester?: boolean }) {

    const columns: ColumnDef<IPayment>[] = [
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => {
                const description = row.getValue("description");
                return (
                    <div
                        title={row.getValue("description")}
                        className="capitalize"
                    >
                        {typeof description === 'string' && description.length > 45 ? `${description.substring(0, 45)}...` : description as string}
                    </div>
                )
            },
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => {
                const amount = row.original?.amount as any;
                const currency = row.original?.currency as string;
                return (
                    <div className="capitalize" >
                        <span className='ml-1 mr-1'>{currency || PaymentCurrency.USD}</span>
                        {amount?.$numberDecimal ? parseFloat(amount.$numberDecimal) : "0"}
                    </div >
                );
            },
        },
        ...(!isTester ? [{
            accessorKey: "createdBy",
            header: "Sender",
            cell: ({ row }: { row: any }) => (
                <div className="">{`${row.original?.senderId?.firstName || ""} ${row.original?.senderId?.lastName || ""}`}</div>
            ),
        }] : []),
        ...(!isTester ? [{
            accessorKey: "receivedBy",
            header: "Receiver",
            cell: ({ row }: { row: any }) => (
                <div className="">{`${row.original?.receiverId?.firstName || ""} ${row.original?.receiverId?.lastName || ""}`}</div>
            ),
        }] : []),
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: { row: any }) => (
                <div className="">
                    {paymentStatusBadge(row.original?.status)}
                </div>
            ),
        },
        ...(!isTester ? [{
            id: "actions",
            enableHiding: false,
            cell: ({ row }: { row: any }) => (
                <PaymentRowActions row={row as Row<IPayment>} refreshPayment={refreshPayment} />
            ),
        }] : []),
    ];


    const [payments, setPayments] = useState<IPayment[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);

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

    const getPayment = async () => {
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
    }

    const refreshPayment = () => {
        getPayment();
    }

    const addPayment = () => {
        setIsOpen(true);
    }

    const closeDialog = () => setIsOpen(false);

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
            getPayment();
        }, 500);
        return () => clearTimeout(debounceFetch);
    }, [pageIndex, pageSize, globalFilter]);

    return (
        <div className='w-full'>
            <AddPayment userId={userId} isOpen={isOpen} closeDialog={closeDialog} refreshPayment={refreshPayment} isTester={isTester} />
            <div className="flex justify-between items-center gap-2 mb-3 mt-3">
                <Input
                    placeholder="Filter projects"
                    value={(globalFilter as string) ?? ""}
                    onChange={(event) => {
                        table.setGlobalFilter(String(event.target.value));
                    }}
                    className="max-w-sm"
                />
                {!isTester &&
                    <Button onClick={() => addPayment()}>
                        <Plus /> Add payment
                    </Button>
                }
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
                        {table && table.getRowModel() && table?.getRowModel()?.rows?.length ? (
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

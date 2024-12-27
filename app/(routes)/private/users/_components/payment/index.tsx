import { IPayment } from '@/app/_interface/payment';
import { getPaymentsByUserService } from '@/app/_services/payment.service';
import toasterService from '@/app/_services/toaster-service'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Row, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';
import React, { useEffect, useState } from 'react'
import AddPayment from './_components/add-payment';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PaymentRowActions } from './_components/row-actions';
import { paymentStatusBadge } from '@/app/_utils/common-functionality';

export default function Payment({ userId }: { userId: string }) {

    const columns: ColumnDef<IPayment>[] = [
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("description")}</div>
            ),
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => {
                const amount = row.original?.amount as any;
                return (
                    <div className="capitalize" >
                        {amount?.$numberDecimal ? parseFloat(amount.$numberDecimal) : "0"
                        }
                    </div >
                );
            },
        },
        {
            accessorKey: "createdBy",
            header: "Created By",
            cell: ({ row }: { row: any }) => (
                <div className="">{`${row.original?.senderId?.firstName} ${row.original?.senderId?.lastName}`}</div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: { row: any }) => (
                <div className="">
                    {paymentStatusBadge(row.original?.status)}
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <PaymentRowActions row={row as Row<IPayment>} refreshPayment={refreshPayment} />
            ),
        },
    ];


    const [payments, setPayments] = useState<IPayment[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);

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
            globalFilter,
            columnVisibility,
            rowSelection,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    const getPayment = async () => {
        setIsLoading(true);
        try {
            const response = await getPaymentsByUserService(userId);
            if (response) {
                setPayments(response);
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

    useEffect(() => {
        getPayment();
    }, []);

    return (
        <div className='w-full'>
            <AddPayment userId={userId} isOpen={isOpen} closeDialog={closeDialog} refreshPayment={refreshPayment} />
            <div className="flex justify-end items-center gap-2 mb-3 mx-1">
                <Button onClick={() => addPayment()}>
                    <Plus /> Add payment
                </Button>
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
        </div>
    )
}

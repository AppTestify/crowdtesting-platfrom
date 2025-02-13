import { UserRoles } from '@/app/_constants/user-roles';
import { showUsersRoleInBadges } from '@/app/_utils/common-functionality';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'

export default function AssigneeUser({ assignedUser }: { assignedUser: any }) {
    const [userData, setUserData] = useState<any>();
    const { data } = useSession();

    let columns: ColumnDef<any>[] = [
        {
            accessorKey: "customId",
            header: "User",
            cell: ({ row }) => {
                const role = row.original.role;
                const name = row.original.fullName;
                return (
                    <div className="capitalize">
                        {userData?.role === UserRoles.ADMIN ?
                            <div>
                                {`${row?.original.customId} ${name
                                    ? `- ${name}`
                                    : ""
                                    }`}
                            </div>
                            :
                            <div>{row.original.customId}</div>
                        }
                    </div>
                );
            },
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                return (
                    <div className="">
                        {showUsersRoleInBadges(row.getValue("role"))}
                    </div>
                );
            },
        },
        {
            accessorKey: "noOfAssigned",
            header: "#",
            cell: ({ row }) => {
                return (
                    <div className="">
                        {row.original.noOfAssigned}
                    </div>
                );
            },
        },
    ];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const table = useReactTable({
        data: assignedUser,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        globalFilterFn: "includesString",
        state: {
            sorting,
            columnVisibility,
        },
    });

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    return (
        <div className='p-4 rounded-md border'>
            <div className='font-semibold '>
                Issues by assignee
            </div>
            <div className='my-1 mb-2 text-gray-500 text-sm'>
                Shows number of issues assign to users
            </div>
            <div className="rounded-md border">
                {assignedUser &&
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
                            {table?.getRowModel().rows?.length ? (
                                table?.getRowModel().rows.map((row) => (
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
                                        <div className='text-gray-500 text-xl'>
                                            {assignedUser.length === 0 && "No data found"}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                }
            </div>
        </div>

    )
}

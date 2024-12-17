"use client"

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
    ColumnDef,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { getProjectUsersService } from "@/app/_services/project.service";
import { AddProjectUser } from "./add-user";
import { ProjectUserRowActions } from "./row-actions";
import { IProjectUserDisplay } from "@/app/_interface/project";
import { formatDate } from "@/app/_constants/date-formatter";
import { statusBadgeProjectUserRole } from "@/app/_utils/common-functionality";

export default function ProjectUsers() {
    const columns: ColumnDef<IProjectUserDisplay>[] = [
        {
            accessorKey: "customId",
            header: "ID",
            cell: ({ row }) => (
                <div className="capitalize">
                    {`${row.original?.customId}`}
                </div>
            ),
        },
        {
            accessorFn: (row) => row.role || "",
            accessorKey: "projectUserRole",
            header: "Project user role",
            cell: ({ row }) => (
                <div className="capitalize">{statusBadgeProjectUserRole(row.original?.role)}</div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Created on",
            cell: ({ row }) => (
                <div className="capitalize">{formatDate(row.original?.createdAt)}</div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <ProjectUserRowActions row={row} projectId={projectId} refreshProjectUsers={refreshProjectUsers} />
            ),
        },
    ];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [projectUsers, setProjectUsers] = useState<IProjectUserDisplay[]>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(7);

    const { projectId } = useParams<{ projectId: string }>();
    useEffect(() => {
        getProjectUsers();
    }, []);

    const getProjectUsers = async () => {
        setIsLoading(true);
        const projectUsers = await getProjectUsersService(projectId);
        setProjectUsers(projectUsers?.users);
        setIsLoading(false);
    };

    const refreshProjectUsers = () => {
        getProjectUsers();
        setRowSelection({});
    };

    const table = useReactTable({
        data: projectUsers,
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
            pagination: {
                pageIndex,
                pageSize,
            },
        },
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: (updater) => {
            const newPagination =
                typeof updater === "function"
                    ? updater({ pageIndex, pageSize })
                    : updater;
            setPageIndex(newPagination.pageIndex);
            setPageSize(newPagination.pageSize);
        },
    });

    return (
        <main className="mx-4 mt-2">
            <div className="">
                <h2 className="text-medium">Users</h2>
                <span className="text-xs text-gray-600">
                    Meet the team driving the success of this project with their expertise and dedication.
                </span>
            </div>
            <div className="w-full">
                <div className="flex items-center py-4 justify-between">
                    <Input
                        placeholder="Filter Users"
                        value={(globalFilter as string) ?? ""}
                        onChange={(event) => {
                            table.setGlobalFilter(String(event.target.value));
                        }}
                        className="max-w-sm"
                    />
                    <div className="flex gap-2 ml-2">
                        <AddProjectUser refreshProjectUsers={refreshProjectUsers} />
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

                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}

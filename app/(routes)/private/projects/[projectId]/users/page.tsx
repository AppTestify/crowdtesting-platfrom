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
import { statusBadgeProjectUserRole } from "@/app/_utils/common-functionality";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { getUsernameWithUserId, getUsernameWithUserIdReverse } from "@/app/_utils/common";
import ExpandableTable from "@/app/_components/expandable-table";

export default function ProjectUsers() {
    const [userData, setUserData] = useState<any>();

    const columns: ColumnDef<IProjectUserDisplay>[] = [
        {
            accessorKey: "userName",
            header: "Name",
            cell: ({ row }) => (
                <div className="capitalize">
                    {getUsernameWithUserIdReverse(row.original)}
                </div>
            ),
        },
        {
            accessorKey: "skills",
            header: "Skills",
            cell: ({ row }) => {
                const skills = row.original?.tester?.skills;
                const formattedSkills = skills?.map(skill => ({ name: skill }));
                return (
                    <div>
                        <ExpandableTable row={formattedSkills as any[]} />
                    </div>
                );
            },
        },
        {
            accessorKey: "language",
            header: "Language",
            cell: ({ row }) => (
                <div className="capitalize">
                    <ExpandableTable row={row.original.tester?.languages as any[]} />
                </div>
            ),
        },
        {
            accessorFn: (row) => row.role || "",
            accessorKey: "projectUserRole",
            header: "Role",
            cell: ({ row }) => (
                <div className="capitalize">{statusBadgeProjectUserRole(row.original?.role)}</div>
            ),
        },
        {
            accessorFn: (row) => row.tester?.address?.city || "",
            accessorKey: "city",
            header: "City",
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.original?.tester?.address?.city}
                </div>
            ),
        },
        {
            accessorFn: (row) => row.tester?.address?.city || "",
            accessorKey: "country",
            header: "Country",
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.original?.tester?.address?.country}
                </div>
            ),
        },
        ...(
            userData?.role === UserRoles.ADMIN ?
                [{
                    id: "actions",
                    enableHiding: false,
                    cell: ({ row }: { row: any }) => (
                        <ProjectUserRowActions row={row} projectId={projectId} refreshProjectUsers={refreshProjectUsers} />
                    ),
                }] : []
        ),
    ];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [projectUsers, setProjectUsers] = useState<IProjectUserDisplay[]>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(7);
    const { data } = useSession();

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

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
                    {userData?.role === UserRoles.ADMIN &&
                        <div className="flex gap-2 ml-2">
                            <AddProjectUser refreshProjectUsers={refreshProjectUsers} />
                        </div>
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
            </div>
        </main>
    );
}

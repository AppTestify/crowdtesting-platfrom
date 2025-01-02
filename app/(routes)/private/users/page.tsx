"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { getUsersService } from "@/app/_services/user.service";
import { IUserByAdmin } from "@/app/_interface/user";
import { UserRowActions } from "./_components/row-actions";
import { AddUser } from "./_components/add-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarFallbackText, getFormattedBase64ForSrc } from "@/app/_utils/string-formatters";
import { UserBulkDelete } from "./_components/bulk-delete";
import UserStatus from "./_components/user-status";
import { UserRoles } from "@/app/_constants/user-roles";
import { formatDistanceToNow } from "date-fns";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_LIST, UserStatusList } from "@/app/_constants/user-status";
import { X } from "lucide-react";
import { showUsersRoleInBadges } from "@/app/_utils/common-functionality";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ViewTesterIssue from "./_components/view-user";
import ViewClientUser from "./_components/client/view-user";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";

export default function Users() {
    const [selectedRole, setSelectedRole] = useState<string>(UserRoles.TESTER);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const columns: ColumnDef<IUserByAdmin>[] = [
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
            accessorKey: "customId",
            header: "ID",
            cell: ({ row }) => (
                <div className="hover:text-primary hover:cursor-pointer"
                    onClick={() => getUser(row.original as IUserByAdmin)}
                >{row.getValue("customId")}</div>
            ),
        },
        {
            accessorKey: "profilePicture",
            header: "Profile Picture",
            cell: ({ row }) => (
                <div className="flex">
                    <Avatar className="h-10 w-10">
                        <AvatarImage
                            src={getFormattedBase64ForSrc(row.original?.profilePicture)}
                            alt="@profilePicture"
                        />
                        <AvatarFallback>
                            {getAvatarFallbackText({
                                ...row.original,
                                name: `${row.original?.firstName || ""} ${row.original?.lastName || ""
                                    }`,
                            })}
                        </AvatarFallback>
                    </Avatar>
                </div>
            ),
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <div className="hover:text-primary hover:cursor-pointer"
                    onClick={() => getUser(row.original as IUserByAdmin)}
                >
                    {row.getValue("email")}</div>
            ),
        },
        ...(UserRoles.TESTER === selectedRole
            ? [
                {
                    accessorKey: "testerCountry",
                    header: "Country",
                    cell: ({ row }: { row: any }) => (
                        <div className="">{row.original?.tester?.address?.country}</div>
                    ),
                },
                {
                    accessorKey: "testerCity",
                    header: "City",
                    cell: ({ row }: { row: any }) => (
                        <div className="">{row.original?.tester?.address?.city}</div>
                    ),
                },
            ]
            : []),
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => (
                <div className="capitalize">
                    {showUsersRoleInBadges(row.getValue("role"))}
                </div>
            ),
        },
        {
            accessorKey: "since",
            header: "Since",
            cell: ({ row }) => (
                <div className="capitalize">
                    {row.original?.createdAt
                        ? formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })
                        : "Date not available"}
                </div>
            ),
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => (
                <UserStatus
                    status={row.getValue("isActive")}
                    userId={row.original?.id as string}
                    refreshUsers={refreshUsers}
                />
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <UserRowActions row={row} refreshUsers={refreshUsers} />
            ),
        },
    ];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [users, setUsers] = useState<IUserByAdmin[]>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [filteredUsers, setFilteredUsers] = useState<IUserByAdmin[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<UserStatusList | any>("");
    const [isClientViewOpen, setIsClientViewOpen] = useState(false);
    const [user, setUser] = useState<IUserByAdmin>();

    useEffect(() => {
        getUsers();
    }, [pageIndex, pageSize, selectedStatus, selectedRole]);

    const handleStatusChange = (status: UserStatusList) => {
        setSelectedStatus(status);
    };

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
    };

    const resetFilter = () => {
        setSelectedStatus("");
        setFilteredUsers(users);
    }

    const getUsers = async () => {
        setIsLoading(true);
        try {
            const users = await getUsersService(pageIndex, pageSize, selectedRole, selectedStatus);
            setUsers(users?.users);
            setFilteredUsers(users?.users);
            setTotalPageCount(users?.total)
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const refreshUsers = () => {
        getUsers();
        setRowSelection({});
    };

    const table = useReactTable({
        data: filteredUsers,
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

    const handlePreviousPage = () => {
        if (pageIndex > 1) {
            setPageIndex(pageIndex - 1);
        }
    };

    const getSelectedRows = () => {
        return table.getFilteredSelectedRowModel().rows.map((row) => row.original?.id)
            .filter((id): id is string => id !== undefined);
    };

    const handleNextPage = () => {
        if (pageIndex < Math.ceil(totalPageCount / pageSize)) {
            setPageIndex(pageIndex + 1);
        }
    };

    const getUser = async (data: IUserByAdmin) => {
        setUser(data as IUserByAdmin);
        if (data.role == UserRoles.TESTER) {
            setIsViewOpen(true);
        } else if (data.role == UserRoles.CLIENT) {
            setIsClientViewOpen(true);
        } else {
            null;
        }

    };

    return (
        <main className="mx-4 mt-4">
            <ViewTesterIssue
                user={user as IUserByAdmin}
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
            />

            {/* view client */}
            <ViewClientUser
                user={user as IUserByAdmin}
                sheetOpen={isClientViewOpen}
                setSheetOpen={setIsClientViewOpen}
            />

            <div className="">
                <h2 className="font-medium text-xl text-primary">Users</h2>
            </div>
            <div className="w-full">
                <div className="flex items-center py-4 justify-between">
                    <div className="flex gap-2 w-full max-w-2xl">
                        <Input
                            placeholder="Filter users"
                            value={(globalFilter as string) ?? ""}
                            onChange={(event) => {
                                table.setGlobalFilter(String(event.target.value));
                            }}
                            className="w-full"
                        />

                        <div>
                            <Select
                                value={selectedStatus || ""}
                                onValueChange={(value) => {
                                    handleStatusChange(value as UserStatusList);
                                }}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Search by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {STATUS_LIST.map((status) => (
                                            <SelectItem value={String(status.value)} key={status.status}>
                                                <div className="flex items-center">
                                                    {status.status}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedStatus ?
                            <div>
                                <Button onClick={resetFilter} className="px-3 bg-red-500 hover:bg-red-500">
                                    <X />
                                </Button>
                            </div>
                            : null
                        }
                    </div>
                    <div className="flex justify-end items-center gap-2 mx-1">
                        {getSelectedRows().length ? (
                            <UserBulkDelete
                                ids={getSelectedRows()}
                                refreshUsers={refreshUsers}
                            />
                        ) : null}
                        <AddUser refreshUsers={refreshUsers} />
                    </div>
                </div>
            </div>
            <div className="mt-2 mb-3">
                <Tabs defaultValue="tester"
                    onValueChange={(value) => {
                        if (value === "admin") handleRoleChange(UserRoles.ADMIN);
                        if (value === "tester") handleRoleChange(UserRoles.TESTER);
                        if (value === "client") handleRoleChange(UserRoles.CLIENT);
                    }}
                >
                    <TabsList className="grid grid-cols-3 w-[400px]">
                        <TabsTrigger value="tester">Tester</TabsTrigger>
                        <TabsTrigger value="admin">Admin</TabsTrigger>
                        <TabsTrigger value="client">Client</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div className="rounded-md border mt-6">
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
                        {isLoading ?
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Loading
                                </TableCell>

                            </TableRow>
                            :
                            <>
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
                            </>
                        }
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
        </main >
    );
}

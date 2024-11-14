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
import { USER_ROLE_LIST, UserRoles } from "@/app/_constants/user-roles";
import { formatDistanceToNow } from "date-fns";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_LIST, UserStatusList } from "@/app/_constants/user-status";
import { X } from "lucide-react";
import { PAGINATION_LIMIT } from "@/app/_utils/common";
import { showUsersRoleInBadges } from "@/app/_utils/common-functionality";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserTable from "./_constant";

export default function Users() {
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
                <div className="">{row.getValue("customId")}</div>
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
                <div className="">{row.getValue("email")}</div>
            ),
        },
        {
            accessorKey: "testerCountry",
            header: "Country",
            cell: ({ row }) => (
                <div className="">{row.getValue("testerCountry")}</div>
            ),
        },
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
    const [selectedRole, setSelectedRole] = useState<string>("");

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
        setSelectedRole("");
        setFilteredUsers(users);
    }

    const getUsers = async () => {
        setIsLoading(true);
        const users = await getUsersService(pageIndex, pageSize, selectedRole, selectedStatus);
        setUsers(users?.users);
        setFilteredUsers(users?.users);
        setTotalPageCount(users?.total)
        setIsLoading(false);
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

    const getSelectedRows = () => {
        return table.getFilteredSelectedRowModel().rows.map((row) => row.original?.id)
            .filter((id): id is string => id !== undefined);
    };

    return (
        <main className="mx-4 mt-4">
            <div className="mt-2 mb-3">
                <Tabs defaultValue="admin" className="">
                    <TabsList className="grid grid-cols-3 w-[400px]">
                        <TabsTrigger value="admin">Admin</TabsTrigger>
                        <TabsTrigger value="tester">Tester</TabsTrigger>
                        <TabsTrigger value="client">Client</TabsTrigger>
                    </TabsList>
                    <TabsContent value="admin">
                        <UserTable role={UserRoles.ADMIN} />
                    </TabsContent>
                    <TabsContent value="tester">
                        <UserTable role="TESTER" />
                    </TabsContent>
                    <TabsContent value="client">
                        <UserTable role="CLIENT" />
                    </TabsContent>
                </Tabs>
            </div>

        </main>
    );
}

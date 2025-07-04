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
import { UserBulkDelete } from "./_components/bulk-delete";
import UserStatus from "./_components/user-status";
import { UserRoles } from "@/app/_constants/user-roles";
import { formatDistanceToNow } from "date-fns";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_LIST, UserStatusList } from "@/app/_constants/user-status";
import { ArrowUpDown, Search, Filter, Users as UsersIcon, Mail, MapPin, Clock, Shield, Activity, UserCheck, X } from "lucide-react";
import { showUsersRoleInBadges, showUsersVerifiedInBadges } from "@/app/_utils/common-functionality";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ViewTesterIssue from "./_components/view-user";
import ViewClientUser from "./_components/client/view-user";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { NAME_NOT_SPECIFIED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
        },
        {
            accessorKey: "customId",
            header: ({ column }) => {
                const isSorted = column.getIsSorted();
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                        className="h-8 px-1 hover:bg-muted/80"
                    >
                        <span className="font-semibold text-xs">ID</span>
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div 
                    className="group cursor-pointer"
                    onClick={() => getUser(row.original as IUserByAdmin)}
                >
                    <Badge 
                        variant="outline" 
                        className="font-mono text-xs hover:bg-primary hover:text-primary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                        {row.getValue("customId")}
                    </Badge>
                </div>
            ),
            size: 80,
        },
        {
            accessorKey: "email",
            header: ({ column }) => {
                const isSorted = column.getIsSorted();
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                        className="h-8 px-1 hover:bg-muted/80 justify-start"
                    >
                        <Mail className="mr-1 h-3 w-3" />
                        <span className="font-semibold text-xs hidden sm:inline">Email</span>
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div 
                    className="group cursor-pointer flex items-center space-x-1"
                    onClick={() => getUser(row.original as IUserByAdmin)}
                >
                    <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0 sm:hidden" />
                    <span className="font-medium text-xs group-hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-[200px]">
                        {row.getValue("email")}
                    </span>
                </div>
            ),
            size: 200,
        },
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
                        <UsersIcon className="mr-1 h-3 w-3" />
                        <span className="font-semibold text-xs">Name</span>
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const firstName = row.original.firstName || NAME_NOT_SPECIFIED_ERROR_MESSAGE;
                const lastName = row.original?.lastName || "";
                const fullName = `${firstName} ${lastName}`.trim();
                const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
                
                return (
                    <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                            <AvatarFallback className="text-xs bg-muted">
                                {initials || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-xs truncate max-w-[100px] sm:max-w-[150px]">{fullName}</span>
                    </div>
                );
            },
            size: 180,
        },
        ...(UserRoles.TESTER === selectedRole
            ? [
                {
                    accessorKey: "testerCountry",
                    header: ({ column }: { column: any }) => {
                        const isSorted = column.getIsSorted();
                        return (
                            <Button
                                variant="ghost"
                                onClick={() => column.toggleSorting(isSorted === "asc")}
                                className="h-8 px-1 hover:bg-muted/80 hidden lg:flex"
                            >
                                <MapPin className="mr-1 h-3 w-3" />
                                <span className="font-semibold text-xs">Country</span>
                                <ArrowUpDown className="ml-1 h-3 w-3" />
                            </Button>
                        );
                    },
                    cell: ({ row }: { row: any }) => (
                        <div className="items-center space-x-1 hidden lg:flex">
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs truncate max-w-[100px]">
                                {row.original?.tester?.address?.country || 'Not specified'}
                            </span>
                        </div>
                    ),
                    size: 120,
                },
                {
                    accessorKey: "testerCity",
                    header: ({ column }: { column: any }) => {
                        const isSorted = column.getIsSorted();
                        return (
                            <Button
                                variant="ghost"
                                onClick={() => column.toggleSorting(isSorted === "asc")}
                                className="h-8 px-1 hover:bg-muted/80 hidden xl:flex"
                            >
                                <MapPin className="mr-1 h-3 w-3" />
                                <span className="font-semibold text-xs">City</span>
                                <ArrowUpDown className="ml-1 h-3 w-3" />
                            </Button>
                        );
                    },
                    cell: ({ row }: { row: any }) => (
                        <div className="items-center space-x-1 hidden xl:flex">
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs truncate max-w-[100px]">
                                {row.original?.tester?.address?.city || 'Not specified'}
                            </span>
                        </div>
                    ),
                    size: 120,
                },
            ]
            : []),
        {
            accessorKey: "role",
            header: ({ column }) => {
                const isSorted = column.getIsSorted();
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                        className="h-8 px-1 hover:bg-muted/80 hidden md:flex"
                    >
                        <Shield className="mr-1 h-3 w-3" />
                        <span className="font-semibold text-xs">Role</span>
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="items-center hidden md:flex">
                    {showUsersRoleInBadges(row?.original?.role as UserRoles)}
                </div>
            ),
            size: 100,
        },
        {
            accessorKey: "since",
            header: ({ column }) => {
                const isSorted = column.getIsSorted();
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                        className="h-8 px-1 hover:bg-muted/80 hidden lg:flex"
                    >
                        <Clock className="mr-1 h-3 w-3" />
                        <span className="font-semibold text-xs">Joined</span>
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="items-center space-x-1 text-xs hidden lg:flex">
                    <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate max-w-[100px]">
                        {row.original?.createdAt
                            ? formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })
                            : "Date not available"}
                    </span>
                </div>
            ),
            size: 120,
        },
        {
            accessorKey: "verified",
            header: ({ column }) => {
                const isSorted = column.getIsSorted();
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                        className="h-8 px-1 hover:bg-muted/80"
                    >
                        <UserCheck className="mr-1 h-3 w-3" />
                        <span className="font-semibold text-xs hidden sm:inline">Verified</span>
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="flex items-center">
                    {showUsersVerifiedInBadges(row.original.isVerified)}
                </div>
            ),
            size: 80,
        },
        {
            accessorKey: "isActive",
            header: ({ column }) => {
                const isSorted = column.getIsSorted();
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(isSorted === "asc")}
                        className="h-8 px-1 hover:bg-muted/80"
                    >
                        <Activity className="mr-1 h-3 w-3" />
                        <span className="font-semibold text-xs">Status</span>
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <UserStatus
                    status={row.getValue("isActive")}
                    userId={row.original?.id as string}
                    refreshUsers={refreshUsers}
                />
            ),
            size: 100,
        },
        {
            id: "actions",
            enableHiding: false,
            header: () => <span className="font-semibold text-xs">Actions</span>,
            cell: ({ row }) => (
                <UserRowActions row={row} refreshUsers={refreshUsers} />
            ),
            size: 80,
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
    const [allUsers, setAllUsers] = useState<IUserByAdmin[]>([]);

    const handleStatusChange = (status: UserStatusList) => {
        setSelectedStatus(status);
    };

    const handleRoleChange = (role: string) => {
        setPageIndex(1);
        setSelectedRole(role);
    };

    const resetFilter = () => {
        setSelectedStatus("");
        setFilteredUsers(users);
    }

    const getUsers = async () => {
        setIsLoading(true);
        try {
            const users = await getUsersService(pageIndex, pageSize, selectedRole, selectedStatus, globalFilter as unknown as string);
            setUsers(users?.users);
            setFilteredUsers(users?.users);
            setTotalPageCount(users?.total)
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch all users for dashboard stats
    const getAllUsers = async () => {
        try {
            const response = await getUsersService(
                1, // page 1
                999999, // large page size to get all
                selectedRole,
                selectedStatus,
                globalFilter as unknown as string
            );
            setAllUsers(response?.users || []);
        } catch (error) {
            setAllUsers([]);
        }
    };

    useEffect(() => {
        const debounceFetch = setTimeout(() => {
            getUsers();
            getAllUsers();
        }, 500);
        return () => clearTimeout(debounceFetch);
    }, [globalFilter, pageIndex, pageSize, selectedStatus, selectedRole]);

    useEffect(() => {
        if ((Array.isArray(globalFilter) && globalFilter.length > 0) || (typeof globalFilter === 'string' && globalFilter.trim() !== "")) {
            setPageIndex(1);
        }
    }, [globalFilter]);

    const refreshUsers = () => {
        getUsers();
        getAllUsers();
        setRowSelection({});
    };

    useEffect(() => {
        getAllUsers();
    }, []);

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
        return table.getFilteredSelectedRowModel()?.rows?.map((row) => row.original?.id)
            .filter((id): id is string => id !== undefined);
    };

    const handleNextPage = () => {
        if (pageIndex < Math.ceil(totalPageCount / pageSize)) {
            setPageIndex(pageIndex + 1);
        }
    };

    const getUser = async (data: IUserByAdmin) => {
        setUser(data as IUserByAdmin);
        if (data.role === UserRoles.TESTER || data.role === UserRoles.CROWD_TESTER) {
            setIsViewOpen(true);
        } else {
            setIsClientViewOpen(true);
        }
    };

    // Calculate statistics from allUsers
    const activeUsers = allUsers.filter(user => user.isActive).length;
    const verifiedUsers = allUsers.filter(user => user.isVerified).length;
    const recentUsers = allUsers.filter(user => {
        if (!user.createdAt) return false;
        const created = new Date(user.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return created > thirtyDaysAgo;
    }).length;

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case UserRoles.TESTER: return 'Testers';
            case UserRoles.CROWD_TESTER: return 'Crowd Testers';
            case UserRoles.PROJECT_ADMIN: return 'Project Admins';
            case UserRoles.CLIENT: return 'Clients';
            case UserRoles.MANAGER: return 'Managers';
            case UserRoles.DEVELOPER: return 'Developers';
            default: return 'Users';
        }
    };

    return (
        <div className="w-full max-w-full overflow-hidden">
            <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
                <ViewTesterIssue
                    user={user as IUserByAdmin}
                    sheetOpen={isViewOpen}
                    setSheetOpen={setIsViewOpen}
                />

                <ViewClientUser
                    user={user as IUserByAdmin}
                    sheetOpen={isClientViewOpen}
                    setSheetOpen={setIsClientViewOpen}
                />

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
                            {getRoleDisplayName(selectedRole)}
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manage user accounts and permissions
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        {getSelectedRows().length > 0 && (
                            <UserBulkDelete
                                ids={getSelectedRows()}
                                refreshUsers={refreshUsers}
                            />
                        )}
                        <AddUser refreshUsers={refreshUsers} />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium truncate">Total {getRoleDisplayName(selectedRole)}</CardTitle>
                            <UsersIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{totalPageCount}</div>
                            <p className="text-xs text-muted-foreground">All time</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Active Users</CardTitle>
                            <Activity className="h-4 w-4 text-green-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-green-600">{activeUsers}</div>
                            <p className="text-xs text-muted-foreground">Currently active</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Verified Users</CardTitle>
                            <UserCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-blue-600">{verifiedUsers}</div>
                            <p className="text-xs text-muted-foreground">Email verified</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">New This Month</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{recentUsers}</div>
                            <p className="text-xs text-muted-foreground">Last 30 days</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Role Tabs */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <Tabs 
                            defaultValue="tester"
                            onValueChange={(value) => {
                                if (value === "admin") handleRoleChange(UserRoles.PROJECT_ADMIN);
                                if (value === "tester") handleRoleChange(UserRoles.TESTER);
                                if (value === "client") handleRoleChange(UserRoles.CLIENT);
                                if (value === "manager") handleRoleChange(UserRoles.MANAGER);
                                if (value === "developer") handleRoleChange(UserRoles.DEVELOPER);
                                if (value === "crowd-tester") handleRoleChange(UserRoles.CROWD_TESTER);
                            }}
                        >
                            <div className="w-full overflow-x-auto">
                                <TabsList className="grid grid-cols-6 w-full min-w-[480px]">
                                    <TabsTrigger value="tester" className="text-xs sm:text-sm px-2 sm:px-4">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="hidden xs:inline">Testers</span>
                                            <span className="xs:hidden">Test</span>
                                        </div>
                                    </TabsTrigger>
                                    <TabsTrigger value="admin" className="text-xs sm:text-sm px-2 sm:px-4">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="hidden xs:inline">Admins</span>
                                            <span className="xs:hidden">Admin</span>
                                        </div>
                                    </TabsTrigger>
                                    <TabsTrigger value="client" className="text-xs sm:text-sm px-2 sm:px-4">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="hidden xs:inline">Clients</span>
                                            <span className="xs:hidden">Client</span>
                                        </div>
                                    </TabsTrigger>
                                    <TabsTrigger value="manager" className="text-xs sm:text-sm px-2 sm:px-4">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="hidden xs:inline">Managers</span>
                                            <span className="xs:hidden">Mgr</span>
                                        </div>
                                    </TabsTrigger>
                                    <TabsTrigger value="developer" className="text-xs sm:text-sm px-2 sm:px-4">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="hidden xs:inline">Developers</span>
                                            <span className="xs:hidden">Dev</span>
                                        </div>
                                    </TabsTrigger>
                                    <TabsTrigger value="crowd-tester" className="text-xs sm:text-sm px-2 sm:px-4">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <UsersIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="hidden xs:inline">Crowd Tester</span>
                                            <span className="xs:hidden">Crowd</span>
                                        </div>
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
                            <div className="flex-1 relative min-w-0">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={(globalFilter as string) ?? ""}
                                    onChange={(event) => {
                                        table.setGlobalFilter(event.target.value);
                                    }}
                                    className="pl-9 h-10 w-full"
                                />
                            </div>

                            <div className="flex space-x-2 flex-shrink-0">
                                <Select
                                    value={selectedStatus || ""}
                                    onValueChange={(value) => {
                                        handleStatusChange(value as UserStatusList);
                                    }}
                                >
                                    <SelectTrigger className="w-[100px] sm:w-[140px] h-10">
                                        <Filter className="mr-1 sm:mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Status" />
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

                                {selectedStatus && (
                                    <Button variant="outline" size="icon" onClick={resetFilter} className="h-10 w-10 flex-shrink-0">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
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
                                                            <p className="text-sm text-muted-foreground">Loading users...</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UsersIcon className="h-8 w-8 text-muted-foreground" />
                                                            <p className="text-sm text-muted-foreground">No users found</p>
                                                            <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
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
                                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                                    <span>
                                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                                        {table.getFilteredRowModel().rows.length} row(s) selected
                                    </span>
                                )}
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
    );
}

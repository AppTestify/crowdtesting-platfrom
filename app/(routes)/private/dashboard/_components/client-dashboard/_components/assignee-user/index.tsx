import { UserRoles } from '@/app/_constants/user-roles';
import { showUsersRoleInBadges } from '@/app/_utils/common-functionality';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AssigneeUser({ assignedUser, title, description }:
    { assignedUser: any, title: string, description: string }) {
    const [userData, setUserData] = useState<any>();
    const [globalFilter, setGlobalFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState("all_roles");
    const { data } = useSession();

    // Memoize columns to prevent re-creation on every render
    const columns: ColumnDef<any>[] = useMemo(() => [
        {
            accessorKey: "customId",
            header: "User",
            cell: ({ row }) => {
                const role = row.original.role;
                const name = row.original.fullName;
                return (
                    <div className="capitalize">
                        {userData?.role === UserRoles.ADMIN ?
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                    <Users className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{row?.original.customId}</div>
                                    {name && <div className="text-sm text-gray-500">{name}</div>}
                                </div>
                            </div>
                            :
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                    <Users className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="font-medium text-gray-900">{row.original.customId}</div>
                            </div>
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
            header: "Count",
            cell: ({ row }) => {
                return (
                    <div className="text-center">
                        <Badge variant="secondary" className="text-sm font-semibold px-2 py-1">
                            {row.original.noOfAssigned}
                        </Badge>
                    </div>
                );
            },
        },
    ], [userData?.role]);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    // Memoize unique roles calculation
    const uniqueRoles = useMemo(() => {
        if (!assignedUser) return [];
        return Array.from(new Set(
            assignedUser.map((user: any) => user.role)
                .filter((role: any) => role && role.trim() !== "")
        )) as string[];
    }, [assignedUser]);
    
    // Memoize hasUnknownRoles calculation
    const hasUnknownRoles = useMemo(() => {
        if (!assignedUser) return false;
        return assignedUser.some((user: any) => !user.role || user.role.trim() === "");
    }, [assignedUser]);

    // Memoize filtered data
    const filteredData = useMemo(() => {
        if (!assignedUser) return [];
        
        return assignedUser.filter((user: any) => {
            const matchesGlobalFilter = globalFilter === "" || 
                user.customId.toLowerCase().includes(globalFilter.toLowerCase()) ||
                user.fullName?.toLowerCase().includes(globalFilter.toLowerCase());
            
            const userRole = user.role && user.role.trim() !== "" ? user.role : "unknown";
            const matchesRoleFilter = roleFilter === "all_roles" || userRole === roleFilter;
            
            return matchesGlobalFilter && matchesRoleFilter;
        });
    }, [assignedUser, globalFilter, roleFilter]);

    const table = useReactTable({
        data: filteredData,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnVisibility,
        },
    });

    // Memoize event handlers
    const handleRoleFilterChange = useCallback((value: string) => {
        setRoleFilter(value);
    }, []);

    const clearGlobalFilter = useCallback(() => {
        setGlobalFilter("");
    }, []);

    const clearRoleFilter = useCallback(() => {
        setRoleFilter("all_roles");
    }, []);

    const clearFilters = useCallback(() => {
        setGlobalFilter("");
        setRoleFilter("all_roles");
    }, []);

    const hasActiveFilters = useMemo(() => {
        return globalFilter !== "" || roleFilter !== "all_roles";
    }, [globalFilter, roleFilter]);

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    // Early return if no data
    if (!assignedUser) {
        return (
            <div className='h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 rounded-lg p-4'>
                <div className='text-center py-8'>
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <div className='text-gray-500 text-sm'>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className='h-full border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 rounded-lg p-4'>
            <div className='mb-4'>
                <div className='flex items-center justify-between mb-2'>
                    <div>
                        <h3 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {title}
                        </h3>
                        <p className='text-sm text-gray-600 mt-1'>
                            {description}
                        </p>
                    </div>
                    {hasActiveFilters && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={clearFilters}
                            className="text-xs"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
                
                {/* Filter Controls */}
                <div className='flex flex-col sm:flex-row gap-3 mt-4'>
                    <div className='relative flex-1'>
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search users..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className='flex items-center gap-2'>
                        <Filter className="text-gray-400 h-4 w-4" />
                        <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                            <SelectTrigger className="w-32 text-sm border-gray-300 focus:border-blue-500">
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all_roles">All Roles</SelectItem>
                                {uniqueRoles.map((role: string) => (
                                    <SelectItem key={role} value={role}>
                                        {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
                                    </SelectItem>
                                ))}
                                {hasUnknownRoles && (
                                    <SelectItem value="unknown">Unknown</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {globalFilter && (
                            <Badge variant="secondary" className="text-xs">
                                Search: {globalFilter}
                                <button 
                                    onClick={clearGlobalFilter}
                                    className="ml-1 hover:text-red-600"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                        {roleFilter !== "all_roles" && (
                            <Badge variant="secondary" className="text-xs">
                                Role: {roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1).toLowerCase()}
                                <button 
                                    onClick={clearRoleFilter}
                                    className="ml-1 hover:text-red-600"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            <div className="rounded-lg border border-gray-200 overflow-hidden">
                {assignedUser &&
                    <Table>
                        <TableHeader className="bg-gray-50/80">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-gray-200">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="text-gray-700 font-semibold text-xs">
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
                                        className="hover:bg-gray-50 transition-colors border-gray-100"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-3">
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
                                        <div className='text-center py-8'>
                                            <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <div className='text-gray-500 text-sm'>
                                                {hasActiveFilters ? "No users match your filters" : "No assignments found"}
                                            </div>
                                            {hasActiveFilters && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={clearFilters}
                                                    className="mt-2 text-xs"
                                                >
                                                    Clear filters
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                }
            </div>

            {/* Results Summary */}
            {assignedUser && assignedUser.length > 0 && (
                <div className="mt-3 text-xs text-gray-500 text-center">
                    Showing {filteredData.length} of {assignedUser.length} users
                </div>
            )}
        </div>
    )
}

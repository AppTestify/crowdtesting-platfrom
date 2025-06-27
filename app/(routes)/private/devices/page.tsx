"use client";

import React, { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IDevice } from "@/app/_interface/device";
import { getDevicesService } from "@/app/_services/device.service";
import { IBrowser } from "@/app/_interface/browser";
import { getBrowserService } from "@/app/_services/browser.service";
import { BrowsersList } from "@/app/_components/browsers-list";
import { AddDevice } from "./_components/add-device";
import { RowActions } from "./_components/row-actions";
import { BulkDelete } from "./_components/bulk-delete";
import ViewTesterIssue from "../users/_components/view-user";
import { IUserByAdmin } from "@/app/_interface/user";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { getUsernameWithUserId } from "@/app/_utils/common";
import { ArrowUpDown, Search, Monitor, Smartphone, Globe, Wifi, User, Settings, Activity, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Devices() {
  const [devices, setDevices] = useState<IDevice[]>([]);
  const [userData, setUserData] = useState<any>();

  let columns: ColumnDef<IDevice>[] = [
    ...(
      userData?.role != UserRoles.CLIENT ?
        [{
          id: "select",
          header: ({ table }: { table: any }) => (
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
          cell: ({ row }: { row: any }) => (
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
        }] : []),
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
            <Monitor className="mr-1 h-3 w-3" />
            <span className="font-semibold text-xs">Device Name</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Monitor className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium text-xs capitalize truncate max-w-[120px] sm:max-w-[180px]">
            {row.getValue("name")}
          </span>
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "os",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="h-8 px-1 hover:bg-muted/80"
          >
            <Smartphone className="mr-1 h-3 w-3" />
            <span className="font-semibold text-xs">OS</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Smartphone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <Badge variant="secondary" className="text-xs capitalize">
            {row.getValue("os")}
          </Badge>
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "version",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="h-8 px-1 hover:bg-muted/80"
          >
            <Settings className="mr-1 h-3 w-3" />
            <span className="font-semibold text-xs">Version</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Settings className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs capitalize truncate max-w-[80px]">
            {row.getValue("version")}
          </span>
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "country",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="h-8 px-1 hover:bg-muted/80 hidden md:flex"
          >
            <Globe className="mr-1 h-3 w-3" />
            <span className="font-semibold text-xs">Country</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="items-center space-x-1 hidden md:flex">
          <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs capitalize truncate max-w-[100px]">
            {row.getValue("country")}
          </span>
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "city",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="h-8 px-1 hover:bg-muted/80 hidden lg:flex"
          >
            <Globe className="mr-1 h-3 w-3" />
            <span className="font-semibold text-xs">City</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="items-center space-x-1 hidden lg:flex">
          <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs capitalize truncate max-w-[100px]">
            {row.getValue("city")}
          </span>
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "network",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="h-8 px-1 hover:bg-muted/80 hidden xl:flex"
          >
            <Wifi className="mr-1 h-3 w-3" />
            <span className="font-semibold text-xs">Network</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="items-center space-x-1 hidden xl:flex">
          <Wifi className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs capitalize truncate max-w-[80px]">
            {row.getValue("network")}
          </span>
        </div>
      ),
      size: 100,
    },
    ...(
      devices?.some((item) => item?.userId?._id) ?
        [{
          accessorKey: "createdBy",
          header: ({ column }: { column: any }) => {
            const isSorted = column.getIsSorted();
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(isSorted === "asc")}
                className="h-8 px-1 hover:bg-muted/80 hidden lg:flex"
              >
                <User className="mr-1 h-3 w-3" />
                <span className="font-semibold text-xs">Tester</span>
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            );
          },
          cell: ({ row }: { row: any }) => {
            const user = row.original?.userId;
            const firstName = user?.firstName || "";
            const lastName = user?.lastName || "";
            const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
            const displayName = firstName || lastName 
              ? getUsernameWithUserId(user)
              : user?.email;

            return (
              <div 
                className="items-center space-x-2 cursor-pointer hover:text-primary transition-colors hidden lg:flex"
                onClick={() => getUser(user as IUserByAdmin)}
              >
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarFallback className="text-xs bg-muted">
                    {initials || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs truncate max-w-[120px]">
                  {displayName}
                </span>
              </div>
            );
          },
          size: 150,
        }] : []
    ),
    {
      accessorKey: "browsers",
      header: () => <span className="font-semibold text-xs">Browsers</span>,
      cell: ({ row }) => (
        <div className="max-w-[150px]">
          <BrowsersList
            browsers={browsers}
            selectedBrowsers={row.getValue("browsers")}
          />
        </div>
      ),
      size: 150,
    },
    ...(
      userData?.role != UserRoles.CLIENT && userData?.role != UserRoles.MANAGER && userData?.role != UserRoles.DEVELOPER ?
        [{
          id: "actions",
          header: () => <span className="font-semibold text-xs">Actions</span>,
          cell: ({ row }: { row: any }) => (
            <RowActions
              row={row}
              refreshDevices={refreshDevices}
              browsers={browsers}
            />
          ),
          size: 80,
        }] : []
    ),
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [browsers, setBrowsers] = useState<IBrowser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [user, setUser] = useState<IUserByAdmin>();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const { data } = useSession();

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  const table = useReactTable({
    data: devices,
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

  useEffect(() => {
    getBrowsers();
  }, []);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      getDevices();
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [globalFilter, pageIndex, pageSize]);

  useEffect(() => {
    if ((Array.isArray(globalFilter) && globalFilter.length > 0) || (typeof globalFilter === 'string' && globalFilter.trim() !== "")) {
      setPageIndex(1);
    }
  }, [globalFilter]);

  const getUser = async (data: IUserByAdmin) => {
    setUser(data as IUserByAdmin);
    setIsViewOpen(true);
  };

  const getDevices = async () => {
    setIsLoading(true);
    const devices = await getDevicesService(pageIndex, pageSize, globalFilter as unknown as string);
    setDevices(devices.devices);
    setTotalPageCount(devices.total);
    setIsLoading(false);
  };

  const getBrowsers = async () => {
    const browsers = await getBrowserService();
    setBrowsers(browsers);
  };

  const refreshDevices = () => {
    getDevices();
    setRowSelection({});
  };

  const getSelectedRows = () => {
    return table.getFilteredSelectedRowModel().rows.map((row) => {
      return row.original.id;
    });
  };

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

  // Calculate statistics
  const uniqueOS = new Set(devices.map(device => device.os)).size;
  const devicesWithBrowsers = devices.filter(device => device.browsers && device.browsers.length > 0).length;
  const uniqueCountries = new Set(devices.map(device => device.country)).size;

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
        <ViewTesterIssue
          user={user as IUserByAdmin}
          sheetOpen={isViewOpen}
          setSheetOpen={setIsViewOpen}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
              Available Devices
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage testing devices and their configurations
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {userData?.role != UserRoles.CLIENT && userData?.role != UserRoles.MANAGER && userData?.role != UserRoles.DEVELOPER && (
              <>
                {getSelectedRows().length > 0 && (
                  <BulkDelete
                    ids={getSelectedRows()}
                    refreshDevices={refreshDevices}
                  />
                )}
                <AddDevice browsers={browsers} refreshDevices={refreshDevices} />
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Devices</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{totalPageCount}</div>
              <p className="text-xs text-muted-foreground">Available for testing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Operating Systems</CardTitle>
              <Smartphone className="h-4 w-4 text-blue-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{uniqueOS}</div>
              <p className="text-xs text-muted-foreground">Different OS types</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Browser Ready</CardTitle>
              <Activity className="h-4 w-4 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{devicesWithBrowsers}</div>
              <p className="text-xs text-muted-foreground">With browsers configured</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Global Coverage</CardTitle>
              <Globe className="h-4 w-4 text-purple-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{uniqueCountries}</div>
              <p className="text-xs text-muted-foreground">Countries covered</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search devices by name, OS, version..."
                  value={(globalFilter as string) ?? ""}
                  onChange={(event) => {
                    table.setGlobalFilter(String(event.target.value));
                  }}
                  className="pl-9 h-10 w-full"
                />
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
                              <p className="text-sm text-muted-foreground">Loading devices...</p>
                            </>
                          ) : (
                            <>
                              <Monitor className="h-8 w-8 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">No devices found</p>
                              <p className="text-xs text-muted-foreground">Try adjusting your search or add new devices</p>
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

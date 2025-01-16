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
            />
          ),
          cell: ({ row }: { row: any }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        }] : []),
    ...(
      devices?.some((item) => item?.userId?._id) ?
        [{
          accessorKey: "createdBy",
          header: "Tester",
          cell: ({ row }: { row: any }) =>
            <div className="hover:text-primary cursor-pointer"
              onClick={() => getUser(row.original?.userId as IUserByAdmin)}
            >
              {row.original?.userId?.firstName || row.original?.userId?.lastName
                ? `${row.original?.userId?.firstName || ''} ${row.original?.userId?.lastName || ''}`.trim()
                : row.original?.userId?.email}
            </div>,
        }] : []
    ),
    {
      accessorKey: "os",
      header: "OS",
      cell: ({ row }) => <div className="capitalize">{row.getValue("os")}</div>,
    },
    {
      accessorKey: "version",
      header: "Version",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("version")}</div>
      ),
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("country")}</div>
      ),
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("city")}</div>
      ),
    },
    {
      accessorKey: "network",
      header: "Network",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("network")}</div>
      ),
    },
    {
      accessorKey: "browsers",
      header: "Browsers",
      cell: ({ row }) => (
        <div>
          {
            <BrowsersList
              browsers={browsers}
              selectedBrowsers={row.getValue("browsers")}
            />
          }
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Device Name",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("name")}</div>
      ),
    },
    ...(
      userData?.role != UserRoles.CLIENT ?
        [{
          accessorKey: "actions",
          header: "",
          cell: ({ row }: { row: any }) => <RowActions
            row={row}
            refreshDevices={refreshDevices}
            browsers={browsers}
          />,
        }] : []
    ),
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
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
      // globalFilter,
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

  return (
    <main className="mx-4 mt-4">
      <ViewTesterIssue
        user={user as IUserByAdmin}
        sheetOpen={isViewOpen}
        setSheetOpen={setIsViewOpen}
      />
      <div>
        <h2 className="font-medium text-xl text-primary">Available Devices</h2>
      </div>
      <div className="w-full">
        <div className="flex items-center py-4 justify-between">
          <Input
            placeholder="Filter devices"
            value={(globalFilter as string) ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(String(event.target.value));
            }}
            className="max-w-sm"
          />
          {userData?.role != UserRoles.CLIENT &&
            <div className="flex gap-2 ml-2">
              {getSelectedRows().length ? (
                <BulkDelete
                  ids={getSelectedRows()}
                  refreshDevices={refreshDevices}
                />
              ) : null}
              <AddDevice browsers={browsers} refreshDevices={refreshDevices} />
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
      </div>
    </main>
  );
}

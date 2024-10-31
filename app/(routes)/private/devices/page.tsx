"use client";

import React, { useEffect, useState } from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { RowActions } from "./_components/row-actions";
import { BulkDelete } from "./_components/bulk-delete";

export default function Devices() {
  const columns: ColumnDef<IDevice>[] = [
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
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("name")}</div>
      ),
    },
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
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <RowActions
          row={row}
          refreshDevices={refreshDevices}
          browsers={browsers}
        />
      ),
    },
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [devices, setDevices] = useState<IDevice[]>([]);
  const [browsers, setBrowsers] = useState<IBrowser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<any>([]);

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
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  useEffect(() => {
    getDevices();
    getBrowsers();
  }, []);

  const getDevices = async () => {
    setIsLoading(true);
    const devices = await getDevicesService();
    setDevices(devices);
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

  return (
    <main className="mx-4 mt-4">
      <div>
        <h2 className="font-medium text-xl text-primary">Available Devices</h2>
        <span className="text-xs text-gray-600">
          Your devices will help us recommend and assign projects that match
          your expertise.
        </span>
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
          <div className="flex gap-2 ml-2">
            {getSelectedRows().length ? (
              <BulkDelete
                ids={getSelectedRows()}
                refreshDevices={refreshDevices}
              />
            ) : null}
            <AddDevice browsers={browsers} refreshDevices={refreshDevices} />
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
        </div>
      </div>
    </main>
  );
}

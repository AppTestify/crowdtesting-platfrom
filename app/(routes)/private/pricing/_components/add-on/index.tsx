import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { Button } from "@/components/ui/button";
import { getAddonService } from "@/app/_services/addon.service";
import { Checkbox } from "@/components/ui/checkbox";
import { AddOnForm } from "../add-on-form";
import { Input } from "@/components/ui/input";
import AddonRowAction from "../addon-row-action";
import { BulkDeleteAddon } from "../bulk-delete-addon";
import { IAddon } from "@/app/_interface/addon";
import AddonStatus from "../addon-status";
import { PaymentCurrency } from "@/app/_constants/payment";
import ViewAddOn from "../view-addon";

function AddOnModel() {
  const [addon, setAddon] = useState<IAddon[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [singleAddon, setSingleAddon] = useState<IAddon | null>(null);

  const getAddon = async () => {
    setIsLoading(true);
    const addon = await getAddonService(
      pageIndex,
      pageSize,
      globalFilter as unknown as string
    );
    setAddon(addon.addon);
    setTotalPageCount(addon.total);
    setIsLoading(false);
  };

  const refreshAddon = () => {
    getAddon();
    setRowSelection({});
  };

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      getAddon();
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [globalFilter, pageIndex, pageSize]);

  let columns: ColumnDef<IAddon>[] = [
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
        <div
          className="capitalize cursor-pointer hover:text-green-600 hover:underline "
          onClick={() => {
            setSingleAddon(row.original);
            setIsViewOpen(true);
          }}
        >
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate text-sm capitalize">
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.original?.amount as any;
        const currency = row.original?.currency as string;
        return (
          <div className="capitalize">
            <span className="ml-1 mr-1">{currency || PaymentCurrency.USD}</span>
            {amount ? parseFloat(amount) : "0"}
          </div>
        );
      },
    },

    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: any) => (
        <AddonStatus
          status={row.getValue("isActive")}
          addonId={row.original.id}
          refreshAddon={refreshAddon}
        />
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <AddonRowAction row={row} refreshAddon={refreshAddon} />
      ),
    },
  ];

  const table = useReactTable({
    data: addon,
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

  const getSelectedRows = () => {
    return table
      ?.getFilteredSelectedRowModel()
      ?.rows?.map((row) => row.original?.id);
  };

  return (
    <>
      <ViewAddOn
        sheetOpen={isViewOpen}
        addon={singleAddon}
        setSheetOpen={setIsViewOpen}
      />
      <div className="flex justify-between">
        <div className="w-1/2">
          <Input
            className="w-full"
            value={(globalFilter as string) ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
            }}
            placeholder="Filter Addon model"
          />
        </div>
        <div className="flex gap-2 ml-2">
          {getSelectedRows()?.length > 0 ? (
            <BulkDeleteAddon
              ids={getSelectedRows()}
              refreshAddon={refreshAddon}
            />
          ) : null}
          <AddOnForm refreshAddon={refreshAddon} />
        </div>
      </div>
      <div className="rounded-md border mt-3">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((tableHeader) => (
              <TableRow key={tableHeader.id}>
                {tableHeader.headers.map((header) => {
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
                  {!isLoading ? "No Results" : "Loading"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
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
    </>
  );
}
export default AddOnModel;

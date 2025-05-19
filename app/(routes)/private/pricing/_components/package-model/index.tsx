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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getPackageService } from "@/app/_services/package.service";
import { IPackage } from "@/app/_interface/package";
import { PaymentCurrency } from "@/app/_constants/payment";
import { AddPackage } from "../add-package";
import PackageStatus from "../package-status";
import PackageRowAction from "../package-row-action";
import { BulkDeletePackage } from "../bulk-delete-package";
import ViewPacakgeModel from "../view-package-model";

function PackageModel() {
  const [packages, setPackage] = useState<IPackage[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  // const [browsers, setBrowsers] = useState<IBrowser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [singlePackage, setSinglePackage] = useState<IPackage | null>(null);

  const getPackage = async () => {
    setIsLoading(true);
    const packages = await getPackageService(
      pageIndex,
      pageSize,
      globalFilter as unknown as string
    );
    setPackage(packages.packages);
    setTotalPageCount(packages.total);
    setIsLoading(false);
  };

  const refreshPackages = () => {
    getPackage();
    setRowSelection({});
  };

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      getPackage();
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [globalFilter, pageIndex, pageSize]);

  let columns: ColumnDef<IPackage>[] = [
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
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("type")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        // <div className="capitalize">{row.getValue("name")}</div>
        <div
          className="capitalize cursor-pointer hover:text-green-600 hover:underline "
          onClick={() => {
            setSinglePackage(row.original);
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
        <div className="max-w-[100px] truncate text-sm capitalize">
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "durationHours",
      header: "Duration",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("durationHours")}</div>
      ),
    },

    {
      accessorKey: "bugs",
      header: "Bugs",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("bugs")}</div>
      ),
    },
    {
      accessorKey: "testCase",
      header: "Test Case",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("testCase")}</div>
      ),
    },

    {
      accessorKey: "testExecution",
      header: "Test Execution",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("testExecution")}</div>
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
      accessorKey: "testers",
      header: "Testers",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("testers")}</div>
      ),
    },

    // {
    //   accessorKey: "moreBugs",
    //   header: "More Bugs",
    //   cell: ({ row }) => (
    //     <div className="capitalize">{row.getValue("moreBugs")}</div>
    //   ),
    // },

    {
      accessorKey: "moreBugs",
      header: "More Bugs",
      cell: ({ row }) => <div>{row.getValue("moreBugs") ? "Yes" : "No"}</div>,
    },

    {
      accessorKey: "isCustom",
      header: "Custom",
      cell: ({ row }) => <div>{row.getValue("isCustom") ? "Yes" : "No"}</div>,
    },

    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: any) => (
        <PackageStatus
          status={row.getValue("isActive")}
          packageId={row.original.id}
          refreshPackages={refreshPackages}
        />
      ),
    },

    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <PackageRowAction row={row} refreshPackages={refreshPackages} />
      ),
    },
  ];

  const table = useReactTable({
    data: packages,
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

  const handleNextPage = () => {
    if (pageIndex < Math.ceil(totalPageCount / pageSize)) {
      setPageIndex(pageIndex + 1);
    }
  };

  const getSelectedRows = () => {
    const selectedRows = table?.getFilteredSelectedRowModel?.()?.rows;
    return selectedRows ? selectedRows.map((row) => row.original?.id) : [];
  };

  return (
    <>
      <ViewPacakgeModel
        sheetOpen={isViewOpen}
        packages={singlePackage}
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
            placeholder="Filter package model"
          />
        </div>

        <div className="flex justify-end items-center gap-2 mx-1">
          {getSelectedRows()?.length ? (
            <BulkDeletePackage
              ids={getSelectedRows()}
              refreshPackages={refreshPackages}
            />
          ) : null}
          <AddPackage refreshPackages={refreshPackages} />
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
export default PackageModel;

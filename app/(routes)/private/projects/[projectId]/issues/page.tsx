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
import { Button } from "@/components/ui/button";
import { getIssuesService } from "@/app/_services/issue.service";
import { IIssue } from "@/app/_interface/issue";
import { AddIssue } from "./_components/add-issue";
import { IssueRowActions } from "./_components/row-actions";
import { useParams } from "next/navigation";
import { displayIcon, statusBadge } from "@/app/_utils/common-functionality";
import { ArrowUpDown } from "lucide-react";

export default function Issues() {
  const columns: ColumnDef<IIssue>[] = [
    {
      accessorKey: "customId",
      header: "ID",
      cell: ({ row }) => (
        <div>{row.getValue("customId")}</div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("severity")}</div>
      ),
    },
    {
      accessorKey: "priority",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Priority
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="capitalize flex items-center">
          <span className="mr-1">
            {displayIcon(row.getValue("priority"))}
          </span>
          {row.getValue("priority")}
        </div>
      ),
    },
    {
      accessorKey: "Device Name",
      header: "Device",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.original?.device && row.original.device.length > 0 ? row.original.device[0]?.name : ''}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div className="ml-1">Status</div>
      ),
      cell: ({ row }) => (
        <div className="capitalize">{statusBadge(row.getValue("status"))}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <IssueRowActions row={row} refreshIssues={refreshIssues} />
      ),
    },
  ];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);
  const [issues, setIssues] = useState<IIssue[]>([]);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(7);

  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    getIssues();
  }, []);

  const getIssues = async () => {
    setIsLoading(true);
    const issues = await getIssuesService(projectId);
    setIssues(issues);
    setIsLoading(false);
  };

  const refreshIssues = () => {
    getIssues();
    setRowSelection({});
  };

  const table = useReactTable({
    data: issues,
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
        <h2 className="text-medium">Issues</h2>
        <span className="text-xs text-gray-600">
          We are experiencing difficulties with state management across multiple tabs,
          leading to inconsistent data in certain components.
        </span>
      </div>
      <div className="w-full">
        <div className="flex py-4 justify-between">
          <Input
            placeholder="Filter Issues"
            value={(globalFilter as string) ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(String(event.target.value));
            }}
            className="max-w-sm"
          />
          <div className="flex gap-2 ml-2">
            <AddIssue refreshIssues={refreshIssues} />
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

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

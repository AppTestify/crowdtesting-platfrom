"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { AddProject } from "./_components/add-project";
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
import { IProjectPayload } from "@/app/_interface/project";
import { Checkbox } from "@/components/ui/checkbox";
import { getProjectsService } from "@/app/_services/project.service";
import { formatDate } from "@/app/_constants/date-formatter";
import { RowActions } from "./_components/row-actions";
import { BulkDelete } from "./_components/bulk-delete";
import ProjectStatus from "./_components/project-status";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PAGINATION_LIMIT } from "@/app/_utils/common";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";

export default function Projects() {
  let columns: ColumnDef<IProjectPayload>[] = [
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
        <div>{row.getValue("customId")}</div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <Link href={`/private/projects/${row.original.id}/projects/overview`}>
          <div className="capitalize hover:text-primary">{row.getValue("title")}</div>
        </Link>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue("startDate")}
        </div>
      ),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue("endDate")}
        </div>
      ),
    },
  ];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);
  const [projects, setProjects] = useState<IProjectPayload[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [userData, setUserData] = useState<any>();
  const { data } = useSession();

  const statusColumn: ColumnDef<IProjectPayload> = {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <ProjectStatus
        status={row.getValue("isActive")}
        projectId={row.original.id}
        refreshProjects={refreshProjects}
      />
    ),
  };

  const actionsColumn: ColumnDef<IProjectPayload> = {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <RowActions row={row} refreshProjects={refreshProjects} />,
  };

  const hasUserId = projects.some((item) => item.userId?._id);
  columns = hasUserId
    ? [
      ...columns,
      {
        accessorKey: "createdBy",
        header: "Created By",
        cell: ({ row }) => <div>
          {`${row.original?.userId?.firstName ? row.original?.userId?.firstName : ""}
           ${row.original?.userId?.lastName ? row.original?.userId?.lastName : ""}`}
        </div>,
      },
      statusColumn,
      actionsColumn
    ]
    : [...columns, statusColumn, actionsColumn];

  useEffect(() => {
    getProjects();
  }, [pageIndex, pageSize]);

  const getProjects = async () => {
    setIsLoading(true);
    const response = await getProjectsService(pageIndex, pageSize);
    const formattedProjects = response?.projects?.map((project: any) => ({
      ...project,
      startDate: formatDate(project.startDate),
      endDate: formatDate(project.endDate),
    }));
    setProjects(formattedProjects as IProjectPayload[]);
    setTotalPageCount(response?.total)
    setIsLoading(false);
  };


  const refreshProjects = () => {
    getProjects();
    setRowSelection({});
  };

  const table = useReactTable({
    data: projects,
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

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  return (
    <main className="mx-4 mt-4">
      <div className="">
        <h2 className="font-medium text-xl text-primary">Projects</h2>
        <span className="text-xs text-gray-600">
          Let us harness your expertise! Our system will analyze your skills to
          connect you with projects that are a perfect fit for your background
          and talents.
        </span>
      </div>
      <div className="w-full">
        <div className="flex items-center py-4 justify-between">
          <Input
            placeholder="Filter projects"
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
                refreshProjects={refreshProjects}
              />
            ) : null}
            {userData?.role != UserRoles.TESTER &&
              <AddProject refreshProjects={refreshProjects} />
            }
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

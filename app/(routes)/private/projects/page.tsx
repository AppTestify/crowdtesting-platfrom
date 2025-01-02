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
import { formatDateWithoutTime } from "@/app/_constants/date-formatter";
import { RowActions } from "./_components/row-actions";
import { BulkDelete } from "./_components/bulk-delete";
import ProjectStatus from "./_components/project-status";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { ArrowUpDown } from "lucide-react";
import { IUserByAdmin } from "@/app/_interface/user";
import ViewTesterIssue from "../users/_components/view-user";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";

export default function Projects() {
  const [userData, setUserData] = useState<any>();

  let columns: ColumnDef<IProjectPayload>[] = [
    ...(userData?.role != UserRoles?.TESTER ? [{
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
    {
      accessorKey: "customId",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
          >
            ID
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const { id } = row.original;
        return (
          <Link href={`/private/projects/${id}/dashboard`}>
            <div className="ml-4 text-primary hover:text-primary">
              {row.getValue("customId")}
            </div>
          </Link>
        );
      },

      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const { id } = row.original;
        return (
          <Link href={`/private/projects/${id}/dashboard`}>
            <div className="ml-4 hover:text-primary">
              {row.getValue("title")}
            </div>
          </Link>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("startDate")}</div>
      ),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("endDate")}</div>
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
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [user, setUser] = useState<IUserByAdmin>();
  const { data } = useSession();

  const statusColumn: ColumnDef<IProjectPayload> = {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <ProjectStatus
        status={row.getValue("isActive")}
        projectId={row.original.id as string}
        refreshProjects={refreshProjects}
      />
    ),
  };

  const actionsColumn: ColumnDef<IProjectPayload> = {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <RowActions row={row as any} refreshProjects={refreshProjects} />
    ),
  };

  const hasUserId = projects.some((item) => item.userId?._id);
  const createdByColumn = {
    accessorKey: "createdBy",
    header: "Created By",
    cell: ({ row }: { row: any }) => {
      const firstName = row.original?.userId?.firstName || "";
      const lastName = row.original?.userId?.lastName || "";
      return (
        <div
          className=""
        // onClick={() => getUser(row.original?.userId as IUserByAdmin)}
        >
          {`${firstName} ${lastName}`.trim()}
        </div>
      );
    },
  };
  columns = hasUserId && userData?.role === UserRoles.ADMIN
    ? [...columns, createdByColumn, statusColumn, actionsColumn] :
    userData?.role === UserRoles.TESTER ? [...columns, statusColumn]
      : [...columns, statusColumn, actionsColumn];

  useEffect(() => {
    getProjects();
  }, [pageIndex, pageSize]);

  const getProjects = async () => {
    setIsLoading(true);
    const response = await getProjectsService(pageIndex, pageSize);
    const formattedProjects = response?.projects?.map((project: any) => ({
      ...project,
      startDate: formatDateWithoutTime(project.startDate),
      endDate: formatDateWithoutTime(project.endDate),
    }));
    setProjects(formattedProjects as IProjectPayload[]);
    setTotalPageCount(response?.total);
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

  const getUser = async (data: IUserByAdmin) => {
    setUser(data as IUserByAdmin);
    setIsViewOpen(true);
  };

  return (
    <main className="mx-4 mt-4">
      <ViewTesterIssue
        user={user as IUserByAdmin}
        sheetOpen={isViewOpen}
        setSheetOpen={setIsViewOpen}
      />
      <div className="">
        <h2 className="font-medium text-xl text-primary">Projects</h2>
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
                ids={getSelectedRows() as string[]}
                refreshProjects={refreshProjects}
              />
            ) : null}
            {userData?.role != UserRoles.TESTER && (
              <AddProject refreshProjects={refreshProjects} />
            )}
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

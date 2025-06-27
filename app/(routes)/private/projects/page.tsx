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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { ArrowUpDown, Calendar, User, Activity, Search, Filter, Plus } from "lucide-react";
import { IUserByAdmin } from "@/app/_interface/user";
import ViewTesterIssue from "../users/_components/view-user";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { DBModels } from "@/app/_constants";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectStatusData, projectStatusList } from "@/app/_constants/project";
import ProjectStatus from "./_components/project-status";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
    }] : []),
    {
      accessorKey: "customId",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="h-8 px-2 lg:px-3 hover:bg-muted/80"
          >
            <span className="font-semibold">Project ID</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const { id } = row.original;
        return (
          <Link href={`/private/projects/${id}/dashboard`}>
            <div className="group flex items-center">
              <Badge 
                variant="outline" 
                className="font-mono text-xs hover:bg-primary hover:text-primary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
              >
                {row.getValue("customId")}
              </Badge>
            </div>
          </Link>
        );
      },
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="h-8 px-2 lg:px-3 hover:bg-muted/80 justify-start"
          >
            <span className="font-semibold">Project Name</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const { id } = row.original;
        return (
          <Link 
            href={`/private/projects/${id}/dashboard`}
            className="group block"
          >
            <div className="flex flex-col">
              <span className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {row.getValue("title")}
              </span>
            </div>
          </Link>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="h-8 px-2 lg:px-3 hover:bg-muted/80"
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span className="font-semibold">Start Date</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {row.original?.startDate !== null ? (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {formatDateWithoutTime(row.getValue("startDate"))}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Not set</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="h-8 px-2 lg:px-3 hover:bg-muted/80"
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span className="font-semibold">End Date</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const endDate = row.original?.endDate;
        const startDate = row.original?.startDate;
        const now = new Date();
        
        // Calculate progress if both dates exist
        let progress = 0;
        let isOverdue = false;
        
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const total = end.getTime() - start.getTime();
          const elapsed = now.getTime() - start.getTime();
          progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
          isOverdue = now > end;
        }

        return (
          <div className="flex items-center space-x-3">
            {endDate !== null ? (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                    {formatDateWithoutTime(String(endDate))}
                  </span>
                </div>
                {startDate && (
                  <div className="w-20">
                    <Progress 
                      value={progress} 
                      className="h-1.5"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Not set</span>
              </div>
            )}
          </div>
        );
      },
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
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [user, setUser] = useState<IUserByAdmin>();
  const { data } = useSession();

  const statusColumn: ColumnDef<IProjectPayload> = {
    accessorKey: "isActive",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(isSorted === "asc")}
          className="h-8 px-2 lg:px-3 hover:bg-muted/80"
        >
          <Activity className="mr-2 h-4 w-4" />
          <span className="font-semibold">Status</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
    header: () => <span className="font-semibold">Actions</span>,
    cell: ({ row }) => (
      <RowActions row={row as any} refreshProjects={refreshProjects} />
    ),
  };

  const hasUserId = projects.some((item) => item.userId?._id);
  const createdByColumn = {
    accessorKey: "createdBy",
    header: ({ column }: { column: any }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(isSorted === "asc")}
          className="h-8 px-2 lg:px-3 hover:bg-muted/80"
        >
          <User className="mr-2 h-4 w-4" />
          <span className="font-semibold">Created By</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: { row: any }) => {
      const firstName = row.original?.userId?.firstName || "";
      const lastName = row.original?.userId?.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim();
      
      return (
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="font-medium text-sm">{fullName || 'Unknown'}</span>
        </div>
      );
    },
  };
  
  columns = hasUserId && userData?.role === UserRoles.ADMIN
    ? [...columns, createdByColumn, statusColumn, actionsColumn] :
    userData?.role === UserRoles.TESTER ? [...columns, statusColumn]
      : [...columns, statusColumn, actionsColumn];

  const getProjects = async () => {
    setIsLoading(true);
    const response = await getProjectsService(pageIndex, pageSize, globalFilter as unknown as string, selectedStatus);
    const formattedProjects = response?.projects?.map((project: any) => ({
      ...project,
      startDate: project?.startDate,
      endDate: project?.endDate
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

  const handleStatusChange = (status: ProjectStatusData | "All") => {
    setPageIndex(1);
    if (status == "All") {
      setSelectedStatus("");
    } else {
      setSelectedStatus(status);
    }
  };

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      getProjects();
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [globalFilter, pageIndex, pageSize, selectedStatus]);

  useEffect(() => {
    if ((Array.isArray(globalFilter) && globalFilter.length > 0) || (typeof globalFilter === 'string' && globalFilter.trim() !== "")) {
      setPageIndex(1);
    }
  }, [globalFilter]);

  useEffect(() => {
    if (pageIndex) {
      localStorage.setItem("entity", DBModels.PROJECT);
    }
  }, [pageIndex]);

  return (
    <div className="flex-1 space-y-6 p-6">
      <ViewTesterIssue
        user={user as IUserByAdmin}
        sheetOpen={isViewOpen}
        setSheetOpen={setIsViewOpen}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your testing projects
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getSelectedRows().length > 0 && (
            <BulkDelete
              ids={getSelectedRows() as string[]}
              refreshProjects={refreshProjects}
            />
          )}
          {userData?.role !== UserRoles.TESTER && (
            <AddProject refreshProjects={refreshProjects} />
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPageCount}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {projects.filter(p => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {projects.filter(p => {
                const endDate = p.endDate ? new Date(p.endDate) : null;
                return endDate && endDate < new Date();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Past end date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => {
                const created = p.createdAt ? new Date(p.createdAt) : null;
                if (!created) return false;
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">New projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects by name, ID, or description..."
                value={(globalFilter as string) ?? ""}
                onChange={(event) => {
                  table.setGlobalFilter(String(event.target.value));
                }}
                className="pl-9 h-10"
              />
            </div>

            <Select
              value={selectedStatus || "All"}
              onValueChange={(value) => {
                handleStatusChange(value as ProjectStatusData);
              }}
            >
              <SelectTrigger className="w-[180px] h-10">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="All">All Status</SelectItem>
                  {projectStatusList.map((status) => (
                    <SelectItem 
                      value={status === ProjectStatusData.ACTIVE ? "true" : "false"} 
                      key={status}
                    >
                      {status}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b bg-muted/50">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="h-12 px-4">
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
                        <TableCell key={cell.id} className="px-4 py-4">
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
                            <p className="text-sm text-muted-foreground">Loading projects...</p>
                          </>
                        ) : (
                          <>
                            <Activity className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">No projects found</p>
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
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/25">
            <div className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <span>
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
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
  );
}

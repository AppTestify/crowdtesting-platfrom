"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useParams } from "next/navigation";
import {
  checkProjectActiveRole,
  displayIcon,
  taskStatusBadge,
  displayDate,
} from "@/app/_utils/common-functionality";
import { ArrowUpDown, Search, ChevronLeft, ChevronRight, CheckSquare, User, Calendar, Loader2, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import toasterService from "@/app/_services/toaster-service";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { NAME_NOT_SPECIFIED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { AddTask } from "./_components/add-task";
import { getTaskService } from "@/app/_services/task.service";
import { TaskRowActions } from "./_components/row-actions";
import { ITask } from "@/app/_interface/task";
import { DBModels } from "@/app/_constants";
import ExpandableTable from "@/app/_components/expandable-table";
import { IRequirement } from "@/app/_interface/requirement";
import { UserRoles } from "@/app/_constants/user-roles";
import Link from "next/link";
import { IProject } from "@/app/_interface/project";
import { getProjectService } from "@/app/_services/project.service";
import { EditTask } from "./_components/edit-task";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskStatus } from "@/app/_constants/issue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Add this helper function at the top of the component
const stripHtml = (html: string) => {
  if (!html) return '';
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

export default function Tasks() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [userData, setUserData] = useState<any>();
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<IProject>();

  // Statistics calculations
  const statistics = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        total: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
        blocked: 0,
        assigned: 0,
        unassigned: 0,
        overdue: 0
      };
    }

    const total = tasks.length;
    const todo = tasks.filter(task => task.status === TaskStatus.TODO).length;
    const inProgress = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
    const done = tasks.filter(task => task.status === TaskStatus.DONE).length;
    const blocked = tasks.filter(task => task.status === TaskStatus.BLOCKED).length;
    const assigned = tasks.filter(task => task.assignedTo?._id).length;
    const unassigned = tasks.filter(task => !task.assignedTo?._id).length;
    const overdue = tasks.filter(task => {
      if (!task.endDate) return false;
      const now = new Date();
      const end = new Date(task.endDate);
      return now > end && task.status !== TaskStatus.DONE;
    }).length;

    return {
      total,
      todo,
      inProgress,
      done,
      blocked,
      assigned,
      unassigned,
      overdue
    };
  }, [tasks]);

  const showTaskRowActions = (task: ITask) => {
    return (
      task.userId?._id?.toString() === userData?._id?.toString() ||
      userData?.role !== UserRoles.TESTER ||
      task?.assignedTo?._id?.toString() === userData?._id?.toString()
    );
  };

  // Enhanced columns with modern styling
  const columns: ColumnDef<ITask>[] = useMemo(() => [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3 hover:bg-gray-100"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const title = row.getValue("title");
        if (typeof title === "string") {
          return (
            <Link
              href={`/private/browse/${projectId}/task/${row.original?.id}`}
              className="hover:text-blue-600"
            >
              <div className="max-w-xs">
                <div className="font-medium truncate hover:text-blue-600" title={title}>
                  {title}
                </div>
                {row.original?.description && (
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {stripHtml(row.original.description).substring(0, 50)}...
                  </div>
                )}
              </div>
            </Link>
          );
        }
      },
      size: 250,
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3 hover:bg-gray-100"
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{displayIcon(row.getValue("priority"))}</span>
          <span className="font-medium capitalize">{row.getValue("priority")}</span>
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3 hover:bg-gray-100"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="max-w-[150px]">
          {taskStatusBadge(row.getValue("status"))}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "assignedTo",
      header: "Assignee",
      cell: ({ row }) => {
        const assignee = row.original?.assignedTo;
        if (!assignee?._id) {
          return <span className="text-gray-400">Unassigned</span>;
        }

        const displayName = userData?.role === UserRoles.ADMIN 
          ? `${assignee?.firstName || NAME_NOT_SPECIFIED_ERROR_MESSAGE} ${assignee?.lastName || ""}`
          : assignee?.customId;

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={assignee?.profilePicture?.data} />
              <AvatarFallback className="text-xs">
                {assignee?.firstName?.charAt(0)}{assignee?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{displayName}</span>
          </div>
        );
      },
      size: 150,
    },
    {
      accessorKey: "issueId",
      header: "Issue",
      cell: ({ row }) => {
        const issue = row.original?.issueId;
        if (!issue?.title) {
          return <span className="text-gray-400">No issue</span>;
        }
        
        return (
          <div className="max-w-xs">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="truncate font-medium" title={issue.title}>
                    {issue.title.length > 30 ? `${issue.title.substring(0, 30)}...` : issue.title}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{issue.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      size: 150,
    },
    {
      accessorKey: "requirementIds",
      header: "Requirements",
      cell: ({ row }) => {
        const requirements = row.original?.requirementIds;
        if (!requirements || requirements.length === 0) {
          return <span className="text-gray-400">No requirements</span>;
        }
        
        return (
          <div className="max-w-xs">
            <ExpandableTable row={requirements as IRequirement[]} />
          </div>
        );
      },
      size: 150,
    },
    {
      accessorKey: "dates",
      header: "Duration",
      cell: ({ row }) => {
        return displayDate(row.original);
      },
      size: 180,
    },
    ...(userData?.role === UserRoles.ADMIN
      ? [
          {
            accessorKey: "createdBy",
            header: "Reporter",
            cell: ({ row }: { row: any }) => {
              const reporter = row.original?.userId;
              if (!reporter) return <span className="text-gray-400">Unknown</span>;
              
              return (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={reporter?.profilePicture?.data} />
                    <AvatarFallback className="text-xs">
                      {reporter?.firstName?.charAt(0)}{reporter?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {`${reporter?.firstName || ""} ${reporter?.lastName || ""}`}
                  </span>
                </div>
              );
            },
            size: 150,
          },
        ]
      : []),
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: { row: any }) => (
        <>
          {showTaskRowActions(row.original) &&
          checkProjectActiveRole(project?.isActive ?? false, userData) ? (
            <TaskRowActions
              row={row}
              onEditClick={(editTask) => {
                setEditTask(editTask);
                setIsEditOpen(true);
              }}
              refreshTasks={refreshTasks}
              userData={userData}
            />
          ) : null}
        </>
      ),
      size: 50,
    },
  ], [userData, projectId, project]);

  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editTask, setEditTask] = useState<ITask | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [task, setTask] = useState<ITask>();
  const [pageIndex, setPageIndex] = useState<number>(() => {
    const entity = localStorage.getItem("entity");
    if (entity === DBModels.TASK) {
      return Number(localStorage.getItem("currentPage")) || 1;
    }
    return 1;
  });
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const { data } = useSession();

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  const getTask = async (data: ITask) => {
    setTask(data as ITask);
    setIsViewOpen(true);
  };

  const getTasks = async () => {
    setIsLoading(true);
    try {
      const response = await getTaskService(
        projectId,
        pageIndex,
        pageSize,
        globalFilter as unknown as string
      );
      setTasks(response?.tasks || []);
      setTotalPageCount(response?.total || 0);
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTasks = () => {
    getTasks();
    setRowSelection({});
  };

  const table = useReactTable({
    data: tasks,
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

  const getProject = async () => {
    try {
      const response = await getProjectService(projectId);
      setProject(response);
    } catch (error) {
      toasterService.error();
    }
  };

  useEffect(() => {
    getProject();
  }, []);

  useEffect(() => {
    localStorage.setItem("currentPage", pageIndex.toString());
    localStorage.setItem("entity", DBModels.TASK);
  }, [pageIndex]);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      getTasks();
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [globalFilter, pageIndex, pageSize]);

  useEffect(() => {
    if (
      (Array.isArray(globalFilter) && globalFilter.length > 0) ||
      (typeof globalFilter === "string" && globalFilter.trim() !== "")
    ) {
      setPageIndex(1);
    }
  }, [globalFilter]);

  return (
    <div className="w-full space-y-6 p-6">
      {editTask && (
        <EditTask
          refreshTasks={refreshTasks}
          task={editTask as ITask}
          sheetOpen={isEditOpen}
          setSheetOpen={setIsEditOpen}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-blue-600" />
            Tasks
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track project tasks and assignments
          </p>
        </div>
        {checkProjectActiveRole(project?.isActive ?? false, userData) && (
          <AddTask refreshTasks={refreshTasks} />
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.done}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.assigned}</p>
            </div>
            <User className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Project Tasks</h2>
              <p className="text-sm text-gray-600">
                {totalPageCount > 0 
                  ? `Showing ${((pageIndex - 1) * pageSize) + 1} to ${Math.min(pageIndex * pageSize, totalPageCount)} of ${totalPageCount} tasks`
                  : "No tasks found"
                }
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
                  value={(globalFilter as string) ?? ""}
                  onChange={(event) => {
                    setGlobalFilter(event.target.value);
                  }}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden mx-6 mb-6">
          <Table className="table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Loading tasks...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-gray-50"
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
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CheckSquare className="h-12 w-12 text-gray-400" />
                      <div className="text-center">
                        <h3 className="font-medium text-gray-900">No tasks found</h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {(globalFilter as string)
                            ? "Try adjusting your search criteria" 
                            : "Create your first task to get started"
                          }
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && table.getRowModel().rows?.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {((pageIndex - 1) * pageSize) + 1} to {Math.min(pageIndex * pageSize, totalPageCount)} of {totalPageCount} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={pageIndex === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm font-medium">
                Page {pageIndex} of {Math.ceil(totalPageCount / pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={pageIndex >= Math.ceil(totalPageCount / pageSize)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  Row,
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
import { ITestCyclePayload } from "@/app/_interface/test-cycle";
import { ArrowUpDown, ChartNoAxesGantt, Search, ChevronLeft, ChevronRight, PlayCircle, User, Calendar, Loader2, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { AddTestExecution } from "./_components/add-test-execution";
import { getTestExecutionService } from "@/app/_services/test-execution.service";
import { formatDateWithoutTime } from "@/app/_constants/date-formatter";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { TestExecutionRowActions } from "./_components/row-actions";
import { ITestExecution } from "@/app/_interface/test-execution";
import TestExecutionView from "./_components/view-test-execution";
import { checkProjectAdmin } from "@/app/_utils/common";
import { IProject } from "@/app/_interface/project";
import { getProjectService } from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TestExecution() {
  const [testExecution, setTestExecution] = useState<ITestCyclePayload[]>([]);
  const [allTestExecutions, setAllTestExecutions] = useState<ITestCyclePayload[]>([]);
  const [userData, setUserData] = useState<any>();
  const [project, setProject] = useState<IProject>();
  const { projectId } = useParams<{ projectId: string }>();
  const checkProjectRole = checkProjectAdmin(project as IProject, userData);

  // Statistics calculations
  const statistics = useMemo(() => {
    const total = allTestExecutions.length;
    const active = allTestExecutions.filter(te => {
      if (!te.startDate || !te.endDate) return false;
      const now = new Date();
      const start = new Date(te.startDate);
      const end = new Date(te.endDate);
      return now >= start && now <= end;
    }).length;
    
    const completed = allTestExecutions.filter(te => {
      if (!te.endDate) return false;
      const now = new Date();
      const end = new Date(te.endDate);
      return now > end;
    }).length;

    const totalTestCases = allTestExecutions.reduce((sum, te) => {
      const counts = te.resultCounts;
      if (counts) {
        return sum + counts.passed + counts.failed + counts.caused + counts.blocked;
      }
      return sum;
    }, 0);

    const totalPassed = allTestExecutions.reduce((sum, te) => {
      return sum + (te.resultCounts?.passed || 0);
    }, 0);

    const totalFailed = allTestExecutions.reduce((sum, te) => {
      return sum + (te.resultCounts?.failed || 0);
    }, 0);

    return {
      total,
      active,
      completed,
      totalTestCases,
      totalPassed,
      totalFailed
    };
  }, [allTestExecutions]);

  const getStatusBadge = (execution: ITestCyclePayload) => {
    if (!execution.startDate || !execution.endDate) {
      return <Badge variant="secondary" className="text-gray-600 bg-gray-50">Not Scheduled</Badge>;
    }
    
    const now = new Date();
    const start = new Date(execution.startDate);
    const end = new Date(execution.endDate);
    
    if (now < start) {
      return <Badge variant="secondary" className="text-blue-600 bg-blue-50">Scheduled</Badge>;
    } else if (now >= start && now <= end) {
      return <Badge variant="secondary" className="text-green-600 bg-green-50">Active</Badge>;
    } else {
      return <Badge variant="secondary" className="text-gray-600 bg-gray-50">Completed</Badge>;
    }
  };

  // Enhanced columns with modern styling
  const columns: ColumnDef<ITestCyclePayload>[] = useMemo(() => [
    {
      accessorKey: "customId",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3 hover:bg-gray-100"
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div
          className="text-blue-600 cursor-pointer font-medium hover:text-blue-800 ml-3"
          onClick={() => openTestExecutionView(row as Row<ITestCyclePayload>)}
        >
          #{row.original?.customId}
        </div>
      ),
      size: 80,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div
          className="cursor-pointer hover:text-blue-600 max-w-xs"
          onClick={() => openTestExecutionView(row as Row<ITestCyclePayload>)}
        >
          <div className="font-medium truncate" title={row.original?.testCycle?.title}>
            {row.original?.testCycle?.title}
          </div>
          {row.original?.testCycle?.description && (
            <div className="text-xs text-gray-500 mt-1 truncate">
              {row.original.testCycle.description.substring(0, 50)}...
            </div>
          )}
        </div>
      ),
      size: 250,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-purple-600 bg-purple-50">
          {row.original?.type || 'Standard'}
        </Badge>
      ),
      size: 100,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original),
      size: 120,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original?.startDate ? (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-medium">
                {formatDateWithoutTime(row.getValue("startDate"))}
              </span>
            </div>
          ) : (
            <span className="text-gray-400">Not scheduled</span>
          )}
        </div>
      ),
      size: 130,
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original?.endDate ? (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-medium">
                {formatDateWithoutTime(row.getValue("endDate"))}
              </span>
            </div>
          ) : (
            <span className="text-gray-400">Not scheduled</span>
          )}
        </div>
      ),
      size: 130,
    },
    {
      accessorKey: "totalTestCases",
      header: "Results",
      cell: ({ row }) => {
        const counts = row.original?.resultCounts;
        if (!counts) {
          return <span className="text-gray-400">No results</span>;
        }
        
        return (
          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full text-xs flex items-center justify-center font-medium">
                    {counts.passed}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Passed: {counts.passed}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-6 h-6 bg-red-100 text-red-700 rounded-full text-xs flex items-center justify-center font-medium">
                    {counts.failed}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Failed: {counts.failed}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center justify-center font-medium">
                    {counts.caused}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Caution: {counts.caused}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-6 h-6 bg-gray-100 text-gray-700 rounded-full text-xs flex items-center justify-center font-medium">
                    {counts.blocked}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Blocked: {counts.blocked}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      size: 120,
    },
    {
      id: "testCases",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original?.testCycle?.testCases && row.original?.testCycle?.testCases.length > 0 ? (
            <Link href={`/private/projects/${projectId}/test-executions/${row.original?.id}`}>
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <ChartNoAxesGantt className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Test Cases</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Link>
          ) : (
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                    <ChartNoAxesGantt className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>No test cases assigned</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ),
      size: 80,
    },
    ...(userData?.role !== UserRoles.TESTER
      ? [
          {
            id: "actions",
            enableHiding: false,
            cell: ({ row }: { row: any }) => (
              <TestExecutionRowActions
                row={row as Row<ITestExecution>}
                onViewClick={(viewExecution) => {
                  setTestExecutionView(viewExecution);
                  setIsViewOpen(true);
                }}
                refreshTestExecution={refreshTestExecution}
              />
            ),
            size: 50,
          },
        ]
      : []),
  ], [userData, projectId]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);
  const [testExecutionView, setTestExecutionView] = useState<ITestExecution>();
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const { data } = useSession();

  const getProject = async () => {
    setIsLoading(true);
    try {
      const response = await getProjectService(projectId);
      setProject(response);
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProject();
  }, []);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      getTestExecution();
      getAllTestExecutions();
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [pageIndex, pageSize, globalFilter]);

  useEffect(() => {
    getAllTestExecutions();
  }, []);

  const getTestExecution = async () => {
    setIsLoading(true);
    const response = await getTestExecutionService(
      projectId,
      pageIndex,
      pageSize,
      globalFilter as unknown as string
    );
    setTestExecution(response?.testCycles || []);
    setTotalPageCount(response?.total || 0);
    setIsLoading(false);
  };

  // Fetch all test executions for dashboard stats
  const getAllTestExecutions = async () => {
    try {
      const response = await getTestExecutionService(
        projectId,
        1, // page 1
        999999, // large page size to get all
        "" // no search filter for stats
      );
      setAllTestExecutions(response?.testCycles || []);
    } catch (error) {
      setAllTestExecutions([]);
    }
  };

  const tableData = useMemo(
    () => testExecution?.map((testExecute) => testExecute) || [],
    [testExecution]
  );
  
  const table = useReactTable({
    data: tableData,
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

  const refreshTestExecution = () => {
    getTestExecution();
    getAllTestExecutions();
  };

  const openTestExecutionView = (row: Row<ITestCyclePayload>) => {
    setIsViewOpen(true);
    setTestExecutionView(row.original as unknown as ITestExecution);
  };

  useEffect(() => {
    if (pageIndex) {
      localStorage.setItem("entity", "TestExecution");
    }
  }, [pageIndex]);

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <TestExecutionView
        sheetOpen={isViewOpen}
        setSheetOpen={setIsViewOpen}
        testExecution={testExecutionView as ITestExecution}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-blue-600" />
            Test Executions
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor your test execution cycles
          </p>
        </div>
        {(userData?.role === UserRoles.ADMIN ||
          userData?.role === UserRoles.PROJECT_ADMIN ||
          userData?.role === UserRoles.CLIENT ||
          userData?.role === UserRoles.TESTER ||
          checkProjectRole) && (
          <AddTestExecution refreshTestExecution={refreshTestExecution} />
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Executions</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
              <PlayCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.active}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Test Cases</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalTestCases}</p>
              </div>
              <ChartNoAxesGantt className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Test Executions</CardTitle>
              <CardDescription>
                {totalPageCount > 0 
                  ? `Showing ${((pageIndex - 1) * pageSize) + 1} to ${Math.min(pageIndex * pageSize, totalPageCount)} of ${totalPageCount} test executions`
                  : "No test executions found"
                }
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search test executions..."
                  value={(globalFilter as string) ?? ""}
                  onChange={(event) => {
                    table.setGlobalFilter(String(event.target.value));
                  }}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="border rounded-lg">
            <Table>
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
                        <span>Loading test executions...</span>
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
                        <PlayCircle className="h-12 w-12 text-gray-400" />
                        <div className="text-center">
                          <h3 className="font-medium text-gray-900">No test executions found</h3>
                          <p className="text-gray-500 text-sm mt-1">
                            {(globalFilter as string)
                              ? "Try adjusting your search criteria" 
                              : "Create your first test execution to get started"
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
        </CardContent>
      </Card>
    </div>
  );
}

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
import { getTestCycleService } from "@/app/_services/test-cycle.service";
import { ITestCycle } from "@/app/_interface/test-cycle";
import { AddTestCycle } from "./_components/add-test-cycle";
import { TestCycleRowActions } from "./_components/row-actions";
import { formatDateWithoutTime } from "@/app/_constants/date-formatter";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { DBModels } from "@/app/_constants";
import { checkProjectActiveRole } from "@/app/_utils/common-functionality";
import { IProject } from "@/app/_interface/project";
import { getProjectService } from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";
import AssignTestCase from "./_components/assign-test-cases";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUpDown, Search, ChevronLeft, ChevronRight, RotateCcw, User, Calendar, Loader2, UserCheck, CheckCircle2, Clock, AlertTriangle, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Helper function to strip HTML tags
const stripHtml = (html: string) => {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

export default function TestCycle() {
  const [testCycle, setTestCycle] = useState<ITestCycle[]>([]);
  const [allTestCycles, setAllTestCycles] = useState<ITestCycle[]>([]);
  const [userData, setUserData] = useState<any>();
  const [project, setProject] = useState<IProject>();
  const [testCase, setTestCase] = useState<Row<ITestCycle>>();

  // Statistics calculations
  const statistics = useMemo(() => {
    if (!allTestCycles || allTestCycles.length === 0) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        upcoming: 0,
        totalTestCases: 0
      };
    }

    const total = allTestCycles.length;
    const now = new Date();
    
    const active = allTestCycles.filter(cycle => {
      if (!cycle.startDate || !cycle.endDate) return false;
      const start = new Date(cycle.startDate);
      const end = new Date(cycle.endDate);
      return now >= start && now <= end;
    }).length;

    const completed = allTestCycles.filter(cycle => {
      if (!cycle.endDate) return false;
      const end = new Date(cycle.endDate);
      return now > end;
    }).length;

    const upcoming = allTestCycles.filter(cycle => {
      if (!cycle.startDate) return false;
      const start = new Date(cycle.startDate);
      return now < start;
    }).length;

    const totalTestCases = allTestCycles.reduce((sum, cycle) => {
      return sum + (cycle.testCases?.length || 0);
    }, 0);

    return {
      total,
      active,
      completed,
      upcoming,
      totalTestCases
    };
  }, [allTestCycles]);

  const getStatusBadge = (cycle: ITestCycle) => {
    if (!cycle.startDate || !cycle.endDate) {
      return <Badge variant="secondary" className="text-gray-600 bg-gray-50">Not Scheduled</Badge>;
    }
    
    const now = new Date();
    const start = new Date(cycle.startDate);
    const end = new Date(cycle.endDate);
    
    if (now < start) {
      return <Badge variant="secondary" className="text-blue-600 bg-blue-50">Upcoming</Badge>;
    } else if (now >= start && now <= end) {
      return <Badge variant="secondary" className="text-green-600 bg-green-50">Active</Badge>;
    } else {
      return <Badge variant="secondary" className="text-gray-600 bg-gray-50">Completed</Badge>;
    }
  };

  // Enhanced columns with modern styling
  const columns: ColumnDef<ITestCycle>[] = useMemo(() => [
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
      cell: ({ row }) => (
        <div
          className="cursor-pointer hover:text-blue-600 max-w-xs"
        >
          <div className="font-medium truncate" title={row.getValue("title")}>
            {row.getValue("title")}
          </div>
          {row.original?.description && (
            <div className="text-xs text-gray-500 mt-1 truncate">
              {stripHtml(row.original.description).substring(0, 50)}...
            </div>
          )}
        </div>
      ),
      size: 250,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.original),
      size: 120,
    },
    {
      accessorKey: "testCases",
      header: "Test Cases",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="font-medium">
            {row.original?.testCases?.length || 0}
          </span>
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "estimation",
      header: "Duration",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original?.startDate && row.original?.endDate ? (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div className="flex flex-col">
                <span className="font-medium">
                  {formatDateWithoutTime(row.original.startDate)}
                </span>
                <span className="text-xs text-gray-500">
                  to {formatDateWithoutTime(row.original.endDate)}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-gray-400">Not scheduled</span>
          )}
        </div>
      ),
      size: 180,
    },
    ...(testCycle.some((item) => item?.userId?._id)
      ? [
          {
            accessorKey: "createdBy",
            header: "Created By",
            cell: ({ row }: { row: any }) => {
              const creator = row.original?.userId;
              if (!creator) return <span className="text-gray-400">Unknown</span>;
              
              return (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={creator?.profilePicture?.data} />
                    <AvatarFallback className="text-xs">
                      {creator?.firstName?.charAt(0)}{creator?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {`${creator?.firstName || ""} ${creator?.lastName || ""}`}
                  </span>
                </div>
              );
            },
            size: 150,
          },
        ]
      : []),
    ...(userData?.role !== UserRoles.TESTER
      ? [
          {
            accessorKey: "Assign",
            header: "Assign",
            cell: ({ row }: { row: any }) => (
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openAssignTestCase(row)}
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Assign test cases</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ),
            size: 80,
          },
        ]
      : []),
    ...(userData?.role != UserRoles.TESTER &&
    checkProjectActiveRole(project?.isActive ?? false, userData)
      ? [
          {
            id: "actions",
            enableHiding: false,
            cell: ({ row }: { row: any }) => (
              <TestCycleRowActions
                row={row as Row<ITestCycle>}
                refreshTestCycle={refreshTestCycle}
              />
            ),
            size: 50,
          },
        ]
      : []),
  ], [testCycle, userData, project]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);
  const [pageIndex, setPageIndex] = useState<number>(() => {
    const entity = localStorage.getItem("entity");
    if (entity === DBModels.TEST_CYCLE) {
      return Number(localStorage.getItem("currentPage")) || 1;
    }
    return 1;
  });
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const { projectId } = useParams<{ projectId: string }>();
  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
  const { data } = useSession();

  const openAssignTestCase = (row: Row<ITestCycle>) => {
    setIsAssignOpen(true);
    setTestCase(row);
  };

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      getTestCycle();
      getAllTestCycles();
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [globalFilter, pageIndex, pageSize]);

  useEffect(() => {
    getAllTestCycles();
  }, []);

  useEffect(() => {
    if (
      (Array.isArray(globalFilter) && globalFilter.length > 0) ||
      (typeof globalFilter === "string" && globalFilter.trim() !== "")
    ) {
      setPageIndex(1);
    }
  }, [globalFilter]);

  useEffect(() => {
    localStorage.setItem("currentPage", pageIndex.toString());
    localStorage.setItem("entity", DBModels.TEST_CYCLE);
  }, [pageIndex]);

  const getTestCycle = async () => {
    setIsLoading(true);
    try {
      const response = await getTestCycleService(
        projectId,
        pageIndex,
        pageSize,
        globalFilter as unknown as string
      );
      setTestCycle(response?.testCycles || []);
      setTotalPageCount(response?.total || 0);
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all test cycles for dashboard stats
  const getAllTestCycles = async () => {
    try {
      const response = await getTestCycleService(
        projectId,
        1, // page 1
        999999, // large page size to get all
        "" // no search filter for stats
      );
      setAllTestCycles(response?.testCycles || []);
    } catch (error) {
      setAllTestCycles([]);
    }
  };

  const refreshTestCycle = () => {
    getTestCycle();
    getAllTestCycles();
    setRowSelection({});
  };

  const table = useReactTable({
    data: testCycle,
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
      if (response) {
        setProject(response);
      }
    } catch (error) {
      toasterService.error();
    }
  };

  useEffect(() => {
    getProject();
  }, []);

  return (
    <div className="w-full space-y-6 p-6">
      <AssignTestCase
        sheetOpen={isAssignOpen}
        setSheetOpen={setIsAssignOpen}
        row={testCase as Row<ITestCycle>}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-blue-600" />
            Test Cycles
          </h1>
          <p className="text-gray-600 mt-1">
            Manage testing phases and validate product functionality
          </p>
        </div>
        {userData?.role != UserRoles.TESTER &&
          checkProjectActiveRole(project?.isActive ?? false, userData) && (
            <AddTestCycle refreshTestCycle={refreshTestCycle} />
          )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cycles</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
            </div>
            <RotateCcw className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.active}</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.completed}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.upcoming}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Test Cases</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.totalTestCases}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Test Cycles</h2>
              <p className="text-sm text-gray-600">
                {totalPageCount > 0 
                  ? `Showing ${((pageIndex - 1) * pageSize) + 1} to ${Math.min(pageIndex * pageSize, totalPageCount)} of ${totalPageCount} test cycles`
                  : "No test cycles found"
                }
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search test cycles..."
                  value={(globalFilter as string) ?? ""}
                  onChange={(event) => {
                    table.setGlobalFilter(String(event.target.value));
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
                      <span>Loading test cycles...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table &&
                table.getRowModel() &&
                table?.getRowModel()?.rows?.length ? (
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
                      <RotateCcw className="h-12 w-12 text-gray-400" />
                      <div className="text-center">
                        <h3 className="font-medium text-gray-900">No test cycles found</h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {(globalFilter as string)
                            ? "Try adjusting your search criteria" 
                            : "Create your first test cycle to get started"
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

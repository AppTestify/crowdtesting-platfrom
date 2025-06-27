"use client";

import { useEffect, useState, useMemo } from "react";
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
import { getTestSuiteService } from "@/app/_services/test-suite.service";
import { AddTestSuite } from "./_components/add-test-suite";
import { formatDate } from "@/app/_constants/date-formatter";
import { ITestSuite } from "@/app/_interface/test-suite";
import { TestSuiteRowActions } from "./_components/row-actions";
import ViewTestSuite from "./_components/view-test-suite";
import { ArrowUpDown, Search, Filter, Plus, FileText, Users, Calendar, ChevronLeft, ChevronRight, Layers, User, Clock, Loader2, TestTube } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { DBModels } from "@/app/_constants";
import { checkProjectActiveRole } from "@/app/_utils/common-functionality";
import { IProject } from "@/app/_interface/project";
import { getProjectService } from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";
import { EditTestSuite } from "./_components/edit-test-suite";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function TestSuite() {
  const [testSuite, setTestSuite] = useState<ITestSuite[]>([]);
  const [allTestSuites, setAllTestSuites] = useState<ITestSuite[]>([]);
  const [userData, setUserData] = useState<any>();
  const [project, setProject] = useState<IProject>();

  // Statistics calculations
  const statistics = useMemo(() => {
    const total = allTestSuites.length;
    const withRequirements = allTestSuites.filter(suite => suite.requirements && suite.requirements.length > 0).length;
    const withoutRequirements = total - withRequirements;
    const recentlyCreated = allTestSuites.filter(suite => {
      if (!suite.createdAt) return false;
      const suiteDate = new Date(suite.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return suiteDate >= weekAgo;
    }).length;

    return {
      total,
      withRequirements,
      withoutRequirements,
      recentlyCreated
    };
  }, [allTestSuites]);

  // Enhanced columns with better styling
  const columns: ColumnDef<ITestSuite>[] = useMemo(() => [
    {
      accessorKey: "customId",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="hover:bg-blue-50 transition-colors"
          >
            <span className="font-semibold text-gray-700">ID</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div
          className="text-blue-600 cursor-pointer ml-4 font-mono font-semibold hover:text-blue-800 transition-colors"
          onClick={() => getTestSuite(row.original as ITestSuite)}
        >
          #{row.getValue("customId")}
        </div>
      ),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "title",
      header: () => <span className="font-semibold text-gray-700">Title</span>,
      cell: ({ row }) => (
        <div
          className="font-medium hover:text-blue-600 cursor-pointer transition-colors max-w-[300px]"
          onClick={() => getTestSuite(row.original as ITestSuite)}
        >
          <div className="truncate">{row.getValue("title")}</div>
          <div className="text-xs text-gray-500 mt-1 truncate">
            {row.original.description ? row.original.description.substring(0, 60) + "..." : "No description"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "requirements",
      header: () => <span className="font-semibold text-gray-700">Requirements</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-sm font-medium">
              {row.original.requirements?.length || 0} Requirements
            </div>
            <div className="text-xs text-gray-500">
              {row.original.requirements?.length ? "Linked" : "No requirements"}
            </div>
          </div>
        </div>
      ),
    },
    ...(testSuite.some((item) => item.userId?._id)
      ? [
          {
            accessorKey: "CreatedBy",
            header: () => <span className="font-semibold text-gray-700">Created By</span>,
            cell: ({ row }: { row: any }) => (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={row.original?.userId?.profilePicture} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold">
                    {`${row.original?.userId?.firstName?.[0] || ''}${row.original?.userId?.lastName?.[0] || ''}`}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">
                    {`${row.original?.userId?.firstName || ""} ${row.original?.userId?.lastName || ""}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {row.original?.userId?.customId}
                  </div>
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="hover:bg-blue-50 transition-colors"
          >
            <span className="font-semibold text-gray-700">Created On</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <div className="text-sm font-medium">
              {formatDate(row.getValue("createdAt"))}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(row.getValue("createdAt")).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      ),
    },
    ...(userData?.role != UserRoles.TESTER &&
    checkProjectActiveRole(project?.isActive ?? false, userData)
      ? [
          {
            id: "actions",
            enableHiding: false,
            cell: ({ row }: { row: any }) => (
              <TestSuiteRowActions
                row={row as Row<ITestSuite>}
                onEditClick={(editSuite) => {
                  setEditTestSuite(editSuite);
                  setIsEditOpen(true);
                }}
                onViewClick={(viewSuite) => {
                  setTestSuiteData(viewSuite);
                  setIsViewOpen(true);
                }}
                refreshTestSuites={refreshTestSuites}
              />
            ),
          },
        ]
      : []),
  ], [testSuite, userData, project]);

  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editTestSuite, setEditTestSuite] = useState<ITestSuite | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);
  const [pageIndex, setPageIndex] = useState<number>(() => {
    const entity = localStorage.getItem("entity");
    if (entity === DBModels.TEST_SUITE) {
      return Number(localStorage.getItem("currentPage")) || 1;
    }
    return 1;
  });
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [testSuiteData, setTestSuiteData] = useState<ITestSuite>();
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const { projectId } = useParams<{ projectId: string }>();
  const { data } = useSession();

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      getTestSuites();
      getAllTestSuites();
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [pageIndex, pageSize, globalFilter]);

  useEffect(() => {
    getAllTestSuites();
  }, []);

  useEffect(() => {
    localStorage.setItem("currentPage", pageIndex.toString());
    localStorage.setItem("entity", DBModels.TEST_SUITE);
  }, [pageIndex]);

  const getTestSuites = async () => {
    setIsLoading(true);
    const response = await getTestSuiteService(
      projectId,
      pageIndex,
      pageSize,
      globalFilter as unknown as string
    );
    setTestSuite(response?.testSuites || []);
    setTotalPageCount(response?.total || 0);
    setIsLoading(false);
  };

  // Fetch all test suites for dashboard stats
  const getAllTestSuites = async () => {
    try {
      const response = await getTestSuiteService(
        projectId,
        1, // page 1
        999999, // large page size to get all
        "" // no search filter for stats
      );
      setAllTestSuites(response?.testSuites || []);
    } catch (error) {
      setAllTestSuites([]);
    }
  };

  const refreshTestSuites = () => {
    getTestSuites();
    getAllTestSuites();
    setRowSelection({});
  };

  const getTestSuite = async (data: ITestSuite) => {
    setTestSuiteData(data as ITestSuite);
    setIsViewOpen(true);
  };

  const table = useReactTable({
    data: testSuite,
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
    setIsLoading(true);
    try {
      const response = await getProjectService(projectId);
      if (response) {
        setProject(response);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProject();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <ViewTestSuite
        testSuite={testSuiteData as ITestSuite}
        sheetOpen={isViewOpen}
        setSheetOpen={setIsViewOpen}
      />

      {editTestSuite && (
        <EditTestSuite
          testSuite={editTestSuite as ITestSuite}
          sheetOpen={isEditOpen}
          setSheetOpen={setIsEditOpen}
          refreshTestSuites={refreshTestSuites}
        />
      )}

      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Layers className="h-6 w-6 text-blue-600" />
              </div>
              Test Suites
            </h1>
            <p className="text-gray-600 mt-1">
              Organize and manage collections of test cases and requirements
            </p>
          </div>
          {userData?.role != UserRoles.TESTER &&
            checkProjectActiveRole(project?.isActive ?? false, userData) && (
              <AddTestSuite refreshTestSuites={refreshTestSuites} />
            )}
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" />
                Total Test Suites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
              <p className="text-xs text-gray-500 mt-1">
                All test suites in project
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" />
                With Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{statistics.withRequirements}</div>
              <p className="text-xs text-gray-500 mt-1">
                Suites with linked requirements
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TestTube className="h-4 w-4 text-orange-500" />
                Without Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{statistics.withoutRequirements}</div>
              <p className="text-xs text-gray-500 mt-1">
                Suites needing requirements
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                Recent Suites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{statistics.recentlyCreated}</div>
              <p className="text-xs text-gray-500 mt-1">
                Created this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-white">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Test Suites Overview
                </CardTitle>
                <CardDescription>
                  {totalPageCount > 0 
                    ? `Showing ${((pageIndex - 1) * pageSize) + 1} to ${Math.min(pageIndex * pageSize, totalPageCount)} of ${totalPageCount} test suites`
                    : "No test suites found"
                  }
                </CardDescription>
              </div>
              
              {/* Search Bar */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search test suites..."
                    value={(globalFilter as string) ?? ""}
                    onChange={(event) => {
                      table.setGlobalFilter(String(event.target.value));
                    }}
                    className="pl-10 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Table */}
            <div className="overflow-hidden">
              <Table className="table-fixed">
                <TableHeader className="bg-gray-50/50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-b border-gray-200">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="font-semibold text-gray-700 bg-gray-50/50">
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
                      <TableCell
                        colSpan={columns.length}
                        className="h-32 text-center"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                          <span className="text-gray-500">Loading test suites...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="hover:bg-gray-50/50 transition-colors border-b border-gray-100"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell 
                            key={cell.id} 
                            className={`py-4 ${userData?.role != UserRoles.TESTER ? "" : "py-3"}`}
                          >
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
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Layers className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900">No test suites found</h3>
                            <p className="text-gray-500 mt-1">
                              {(globalFilter as string) 
                                ? "Try adjusting your search criteria" 
                                : "Get started by creating your first test suite"
                              }
                            </p>
                          </div>
                          {userData?.role != UserRoles.TESTER &&
                            checkProjectActiveRole(project?.isActive ?? false, userData) && 
                            !(globalFilter as string) && (
                              <AddTestSuite refreshTestSuites={refreshTestSuites} />
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!isLoading && table.getRowModel().rows?.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/30">
                <div className="text-sm text-gray-500">
                  Showing {((pageIndex - 1) * pageSize) + 1} to {Math.min(pageIndex * pageSize, totalPageCount)} of {totalPageCount} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={pageIndex === 1}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-700">
                      Page {pageIndex} of {Math.ceil(totalPageCount / pageSize)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={pageIndex >= Math.ceil(totalPageCount / pageSize)}
                    className="border-gray-300 hover:bg-gray-50"
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
    </div>
  );
}

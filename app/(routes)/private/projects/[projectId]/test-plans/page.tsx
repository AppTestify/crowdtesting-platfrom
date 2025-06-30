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
import { formatDate } from "@/app/_constants/date-formatter";
import { ITestPlan, ITestPlanPayload } from "@/app/_interface/test-plan";
import { getTestPlanService } from "@/app/_services/test-plan.service";
import { AddTestPlan } from "./_components/add-test-plan";
import { TestPlansRowActions } from "./_components/row-actions";
import ViewTestPlan from "./_components/view-test-plan";
import { ArrowUpDown, Search, Filter, Plus, FileText, Users, Calendar, ChevronLeft, ChevronRight, ClipboardList, User, Clock, Loader2 } from "lucide-react";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { DBModels } from "@/app/_constants";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { NAME_NOT_SPECIFIED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { checkProjectActiveRole } from "@/app/_utils/common-functionality";
import { getProjectService } from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";
import { IProject } from "@/app/_interface/project";
import { EditTestPlan } from "./_components/edit-test-plan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function TestPlan() {
  const [testPlans, setTestPlans] = useState<ITestPlanPayload[]>([]);
  const [allTestPlans, setAllTestPlans] = useState<ITestPlanPayload[]>([]);
  const [userData, setUserData] = useState<any>();
  const [project, setProject] = useState<IProject>();
  const [searchTerm, setSearchTerm] = useState("");

  // Statistics calculations
  const statistics = useMemo(() => {
    const total = allTestPlans.length;
    const assigned = allTestPlans.filter(plan => plan.assignedTo?._id).length;
    const unassigned = total - assigned;
    const recentlyCreated = allTestPlans.filter(plan => {
      // Type assertion to handle the createdAt property that exists in the actual data
      const planWithDate = plan as any;
      if (!planWithDate.createdAt) return false;
      const planDate = new Date(planWithDate.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return planDate >= weekAgo;
    }).length;

    return {
      total,
      assigned,
      unassigned,
      recentlyCreated
    };
  }, [allTestPlans]);

  // Enhanced columns with better styling
  const columns: ColumnDef<ITestPlanPayload>[] = useMemo(() => [
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
          onClick={() => getTestPlan(row.original as unknown as ITestPlan)}
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
          onClick={() => getTestPlan(row.original as unknown as ITestPlan)}
        >
          <div className="truncate">{row.getValue("title")}</div>
          <div className="text-xs text-gray-500 mt-1">
            {row.original.parameters?.length || 0} parameters
          </div>
        </div>
      ),
    },
    ...(userData?.role === UserRoles.ADMIN
      ? [
          {
            accessorKey: "createdBy",
            header: () => <span className="font-semibold text-gray-700">Reporter</span>,
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
                    {`${row.original?.userId?.firstName || ""} ${
                      row.original?.userId?.lastName || ""
                    }`}
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
    ...(testPlans.some((item) => item.assignedTo?._id)
      ? [
          {
            accessorKey: "assignedTo",
            header: () => <span className="font-semibold text-gray-700">Assignee</span>,
            cell: ({ row }: { row: any }) => (
              <div>
                {row.original?.assignedTo?._id ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={row.original?.assignedTo?.profilePicture} />
                      <AvatarFallback className="bg-gradient-to-r from-green-500 to-teal-600 text-white text-sm font-semibold">
                        {userData?.role === UserRoles.ADMIN 
                          ? `${row.original?.assignedTo?.firstName?.[0] || ''}${row.original?.assignedTo?.lastName?.[0] || ''}`
                          : row.original?.assignedTo?.customId?.[0] || 'U'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        {userData?.role === UserRoles.ADMIN ? (
                          `${
                            row.original?.assignedTo?.firstName ||
                            NAME_NOT_SPECIFIED_ERROR_MESSAGE
                          } ${row.original?.assignedTo?.lastName || ""}`
                        ) : (
                          row.original?.assignedTo?.customId
                        )}
                      </div>
                      {userData?.role === UserRoles.ADMIN && (
                        <div className="text-xs text-gray-500">
                          {row.original?.assignedTo?.customId}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Unassigned</span>
                  </div>
                )}
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
    ...(userData?.role !== UserRoles.TESTER &&
    checkProjectActiveRole(project?.isActive ?? false, userData)
      ? [
          {
            id: "actions",
            enableHiding: false,
            cell: ({ row }: { row: any }) => (
              <TestPlansRowActions
                row={row as Row<ITestPlan>}
                onEditClick={(editPlan) => {
                  setEditPlan(editPlan);
                  setIsEditOpen(true);
                }}
                onViewClick={(viewPlan) => {
                  setTestPlan(viewPlan);
                  setIsViewOpen(true);
                }}
                refreshTestPlans={refreshTestPlans}
              />
            ),
          },
        ]
      : []),
  ], [userData, testPlans, project]);

  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editPlan, setEditPlan] = useState<ITestPlan | null>(null);
  const { data } = useSession();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);
  const [pageIndex, setPageIndex] = useState<number>(() => {
    const entity = localStorage.getItem("entity");
    if (entity === DBModels.TEST_PLAN) {
      return Number(localStorage.getItem("currentPage")) || 1;
    }
    return 1;
  });
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [testPlan, setTestPlan] = useState<ITestPlan>();
  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      getTestPlans();
      getAllTestPlans();
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [pageIndex, pageSize, globalFilter]);

  useEffect(() => {
    getAllTestPlans();
  }, []);

  useEffect(() => {
    localStorage.setItem("currentPage", pageIndex.toString());
    localStorage.setItem("entity", DBModels.TEST_PLAN);
  }, [pageIndex]);

  const getTestPlans = async () => {
    setIsLoading(true);
    const response = await getTestPlanService(
      projectId,
      pageIndex,
      pageSize,
      globalFilter as unknown as string
    );
    setTestPlans(response?.testPlans || []);
    setTotalPageCount(response?.total || 0);
    setIsLoading(false);
  };

  // Fetch all test plans for dashboard stats
  const getAllTestPlans = async () => {
    try {
      const response = await getTestPlanService(
        projectId,
        1, // page 1
        999999, // large page size to get all
        "" // no search filter for stats
      );
      setAllTestPlans(response?.testPlans || []);
    } catch (error) {
      setAllTestPlans([]);
    }
  };

  const refreshTestPlans = () => {
    getTestPlans();
    getAllTestPlans();
    setRowSelection({});
  };

  const getTestPlan = async (data: ITestPlan) => {
    setTestPlan(data as ITestPlan);
    setIsViewOpen(true);
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

  const table = useReactTable({
    data: testPlans,
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

  useEffect(() => {
    getProject();
  }, []);

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <ViewTestPlan
        testPlan={testPlan as ITestPlan}
        sheetOpen={isViewOpen}
        setSheetOpen={setIsViewOpen}
      />

      {editPlan && (
        <EditTestPlan
          testPlan={editPlan as ITestPlan}
          sheetOpen={isEditOpen}
          setSheetOpen={setIsEditOpen}
          refreshTestPlans={refreshTestPlans}
        />
      )}

      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              Test Plans
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and organize your testing strategies and procedures
            </p>
          </div>
          {userData?.role !== UserRoles.TESTER &&
            checkProjectActiveRole(project?.isActive ?? false, userData) && (
              <AddTestPlan
                refreshTestPlans={refreshTestPlans}
                userData={userData}
              />
            )}
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-blue-500" />
                Total Test Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
              <p className="text-xs text-gray-500 mt-1">
                All test plans in project
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                Assigned Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{statistics.assigned}</div>
              <p className="text-xs text-gray-500 mt-1">
                Plans with assignees
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <User className="h-4 w-4 text-orange-500" />
                Unassigned Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{statistics.unassigned}</div>
              <p className="text-xs text-gray-500 mt-1">
                Plans awaiting assignment
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                Recent Plans
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
                  Test Plans Overview
                </CardTitle>
                <CardDescription>
                  {totalPageCount > 0 
                    ? `Showing ${((pageIndex - 1) * pageSize) + 1} to ${Math.min(pageIndex * pageSize, totalPageCount)} of ${totalPageCount} test plans`
                    : "No test plans found"
                  }
                </CardDescription>
              </div>
              
              {/* Search Bar */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search test plans..."
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
                          <span className="text-gray-500">Loading test plans...</span>
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
                          <TableCell key={cell.id} className="py-4">
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
                            <ClipboardList className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900">No test plans found</h3>
                            <p className="text-gray-500 mt-1">
                              {(globalFilter as string) 
                                ? "Try adjusting your search criteria" 
                                : "Get started by creating your first test plan"
                              }
                            </p>
                          </div>
                          {userData?.role !== UserRoles.TESTER &&
                            checkProjectActiveRole(project?.isActive ?? false, userData) && 
                            !(globalFilter as string) && (
                              <AddTestPlan
                                refreshTestPlans={refreshTestPlans}
                                userData={userData}
                              />
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

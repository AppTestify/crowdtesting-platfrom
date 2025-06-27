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
import { getTestCaseService } from "@/app/_services/test-case.service";
import { ITestCase } from "@/app/_interface/test-case";
import { AddTestCase } from "./_components/add-test-case";
import toasterService from "@/app/_services/toaster-service";
import { getTestWithoutPaginationSuiteService } from "@/app/_services/test-suite.service";
import { ITestSuite } from "@/app/_interface/test-suite";
import { TestCaseRowActions } from "./_components/row-actions";
import ViewTestCase from "./_components/view-test-case";
import { ArrowUpDown, X, Search, ChevronLeft, ChevronRight, TestTube, User, Loader2, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRequirementsWithoutPaginationService } from "@/app/_services/requirement.service";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { DBModels } from "@/app/_constants";
import { checkProjectActiveRole } from "@/app/_utils/common-functionality";
import { getProjectService } from "@/app/_services/project.service";
import { IProject } from "@/app/_interface/project";
import { EditTestCase } from "./_components/edit-test-case";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TEST_CASE_SEVERITY, TEST_TYPE } from "@/app/_constants/test-case";
import { IRequirement } from "@/app/_interface/requirement";

export default function TestCases() {
  const [testCases, setTestCases] = useState<ITestCase[]>([]);
  const [userData, setUserData] = useState<any>();
  const [project, setProject] = useState<IProject>();
  const [testSuites, setTestSuites] = useState<ITestSuite[]>([]);
  const [testCase, setTestCase] = useState<ITestCase>();
  const [requirements, setRequirements] = useState<IRequirement[]>([]);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [editTestCase, setEditTestCase] = useState<ITestCase | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  // Statistics calculations
  const statistics = useMemo(() => {
    const total = testCases.length;
    const automationTests = testCases.filter(tc => tc.testType === TEST_TYPE.AUTOMATION).length;
    const manualTests = testCases.filter(tc => tc.testType === TEST_TYPE.MANUAL).length;
    const highSeverity = testCases.filter(tc => tc.severity === TEST_CASE_SEVERITY.HIGH).length;

    return {
      total,
      automationTests,
      manualTests,
      highSeverity
    };
  }, [testCases]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case TEST_CASE_SEVERITY.HIGH:
        return 'text-red-600 bg-red-50';
      case TEST_CASE_SEVERITY.MEDIUM:
        return 'text-yellow-600 bg-yellow-50';
      case TEST_CASE_SEVERITY.LOW:
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (testType: string) => {
    switch (testType) {
      case TEST_TYPE.AUTOMATION:
        return 'text-blue-600 bg-blue-50';
      case TEST_TYPE.MANUAL:
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Clean helper function to strip HTML tags
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Enhanced columns with cleaner styling
  const columns: ColumnDef<ITestCase>[] = useMemo(() => [
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
          onClick={() => getTestCase(row.original as unknown as ITestCase)}
        >
          #{row.getValue("customId")}
        </div>
      ),
      size: 80,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        const cleanTitle = stripHtml(title);
        return (
          <div
            className="cursor-pointer hover:text-blue-600 max-w-md"
            onClick={() => getTestCase(row.original as unknown as ITestCase)}
          >
            <div className="font-medium truncate" title={cleanTitle}>
              {cleanTitle}
            </div>
            {row.original.expectedResult && (
              <div className="text-xs text-gray-500 mt-1 truncate">
                Expected: {stripHtml(row.original.expectedResult).substring(0, 60)}...
              </div>
            )}
          </div>
        );
      },
      size: 400,
    },
    {
      accessorKey: "testType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary" className={`${getTypeColor(row.original.testType || '')} border-0`}>
          {row.original.testType === TEST_TYPE.AUTOMATION && <Zap className="w-3 h-3 mr-1" />}
          {row.original.testType === TEST_TYPE.MANUAL && <User className="w-3 h-3 mr-1" />}
          {row.original.testType || 'Manual'}
        </Badge>
      ),
      size: 100,
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => (
        <Badge variant="secondary" className={`${getSeverityColor(row.original.severity || '')} border-0`}>
          {row.original.severity === TEST_CASE_SEVERITY.HIGH && <AlertTriangle className="w-3 h-3 mr-1" />}
          {row.original.severity === TEST_CASE_SEVERITY.MEDIUM && <AlertTriangle className="w-3 h-3 mr-1" />}
          {row.original.severity === TEST_CASE_SEVERITY.LOW && <CheckCircle2 className="w-3 h-3 mr-1" />}
          {row.original.severity || 'Low'}
        </Badge>
      ),
      size: 100,
    },
    ...(testCases.some((item) => item?.userId?._id)
      ? [
          {
            accessorKey: "createdBy",
            header: "Created By",
            cell: ({ row }: { row: any }) => (
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={row.original?.userId?.profilePicture} />
                  <AvatarFallback className="text-xs bg-gray-100">
                    {`${row.original?.userId?.firstName?.[0] || ''}${row.original?.userId?.lastName?.[0] || ''}`}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {`${row.original?.userId?.firstName || ""} ${row.original?.userId?.lastName || ""}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {row.original?.userId?.customId}
                  </div>
                </div>
              </div>
            ),
            size: 150,
          },
        ]
      : []),
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3 hover:bg-gray-100"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium">
            {formatDate(row.getValue("createdAt"))}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(row.getValue("createdAt")).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      ),
      size: 120,
    },
    ...(userData?.role != UserRoles.TESTER &&
      checkProjectActiveRole(project?.isActive ?? false, userData)
      ? [
          {
            id: "actions",
            enableHiding: false,
            cell: ({ row }: { row: any }) => (
              <TestCaseRowActions
                row={row as unknown as Row<ITestCase>}
                onEditClick={(testCase) => {
                  setEditTestCase(testCase);
                  setIsEditOpen(true);
                }}
                onViewClick={(testCase) => {
                  setTestCase(testCase);
                  setIsViewOpen(true);
                }}
                testSuites={testSuites}
                refreshTestCases={refreshTestCases}
              />
            ),
            size: 50,
          },
        ]
      : []),
  ], [testCases, userData, project, testSuites]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);
  const [pageIndex, setPageIndex] = useState<number>(() => {
    const entity = localStorage.getItem("entity");
    if (entity === DBModels.TEST_CASE) {
      return Number(localStorage.getItem("currentPage")) || 1;
    }
    return 1;
  });
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const { projectId } = useParams<{ projectId: string }>();

  const [selectedRequirement, setSelectedRequirment] = useState<string>("");
  const { data } = useSession();

  const resetFilter = () => {
    setSelectedRequirment("");
  };

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      getTestCases();
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [pageIndex, pageSize, selectedRequirement, globalFilter]);

  const getTestCases = async () => {
    setIsLoading(true);
    const response = await getTestCaseService(
      projectId,
      pageIndex,
      pageSize,
      selectedRequirement,
      globalFilter as unknown as string
    );
    setTestCases(response?.testCases || []);
    setTotalPageCount(response?.total || 0);
    setIsLoading(false);
  };

  const handleRequirementChange = (requirment: string) => {
    setPageIndex(1);
    setSelectedRequirment(requirment);
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
    getTestSuites();
    getRequirements();
  }, []);

  useEffect(() => {
    localStorage.setItem("currentPage", pageIndex.toString());
    localStorage.setItem("entity", DBModels.TEST_CASE);
  }, [pageIndex]);

  const getRequirements = async () => {
    try {
      const response = await getRequirementsWithoutPaginationService(projectId);
      if (response) {
        setRequirements(response);
      }
    } catch (error) {
      toasterService.error();
    }
  };

  const getTestSuites = async () => {
    try {
      const response = await getTestWithoutPaginationSuiteService(projectId);
      setTestSuites(response || []);
    } catch (error) {
      toasterService.error();
    }
  };

  const refreshTestCases = () => {
    getTestCases();
    setRowSelection({});
  };

  const table = useReactTable({
    data: testCases,
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

  const getTestCase = async (data: ITestCase) => {
    setTestCase(data as ITestCase);
    setIsViewOpen(true);
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

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <ViewTestCase
        testCase={testCase as ITestCase}
        sheetOpen={isViewOpen}
        setSheetOpen={setIsViewOpen}
      />
      {editTestCase && (
        <EditTestCase
          testCases={editTestCase as ITestCase}
          sheetOpen={isEditOpen}
          setSheetOpen={setIsEditOpen}
          testSuites={testSuites}
          refreshTestCases={refreshTestCases}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TestTube className="h-6 w-6 text-blue-600" />
            Test Cases
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your test scenarios and validation procedures
          </p>
        </div>
        {userData?.role != UserRoles.TESTER &&
          checkProjectActiveRole(project?.isActive ?? false, userData) && (
            <AddTestCase
              refreshTestCases={refreshTestCases}
              testSuites={testSuites}
            />
          )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
              <TestTube className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Automation</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.automationTests}</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Manual</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.manualTests}</p>
              </div>
              <User className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.highSeverity}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Test Cases</CardTitle>
              <CardDescription>
                {totalPageCount > 0 
                  ? `Showing ${((pageIndex - 1) * pageSize) + 1} to ${Math.min(pageIndex * pageSize, totalPageCount)} of ${totalPageCount} test cases`
                  : "No test cases found"
                }
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search test cases..."
                  value={(globalFilter as string) ?? ""}
                  onChange={(event) => {
                    table.setGlobalFilter(String(event.target.value));
                  }}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select
                value={selectedRequirement || ""}
                onValueChange={(value) => {
                  handleRequirementChange(value as string);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by requirement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {requirements.map((requirement) => (
                      <SelectItem
                        value={requirement?.id as string}
                        key={requirement.id}
                      >
                        {requirement.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {selectedRequirement && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilter}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
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
                        <span>Loading test cases...</span>
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
                        <TestTube className="h-12 w-12 text-gray-400" />
                        <div className="text-center">
                          <h3 className="font-medium text-gray-900">No test cases found</h3>
                          <p className="text-gray-500 text-sm mt-1">
                            {(globalFilter as string) || selectedRequirement
                              ? "Try adjusting your search or filters" 
                              : "Create your first test case to get started"
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

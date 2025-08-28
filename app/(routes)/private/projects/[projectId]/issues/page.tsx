"use client";

import { useEffect, useState } from "react";
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
import { getIssuesService } from "@/app/_services/issue.service";
import { IIssue, IIssueView } from "@/app/_interface/issue";
import { AddIssue } from "./_components/add-issue";
import { IssueRowActions } from "./_components/row-actions";
import { useParams } from "next/navigation";
import {
  checkProjectActiveRole,
  displayIcon,
  ExportExcelFile,
  statusBadge,
} from "@/app/_utils/common-functionality";
import { ArrowUpDown, Search, Bug, AlertTriangle, User, Calendar, Activity, BarChart3, CheckCircle, X } from "lucide-react";
import ViewIssue from "./_components/view-issue";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import toasterService from "@/app/_services/toaster-service";
import { getProjectService } from "@/app/_services/project.service";
import { IProject } from "@/app/_interface/project";
import Link from "next/link";
import { generateExcelFile } from "@/app/_helpers/generate-excel.helper";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { checkProjectAdmin } from "@/app/_utils/common";
import { NAME_NOT_SPECIFIED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { DBModels } from "@/app/_constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ISSUE_STATUS_LIST,
  IssueStatus,
  Priority,
  PRIORITY_LIST,
  Severity,
  SEVERITY_LIST,
} from "@/app/_constants/issue";
import { getTestCycleListService } from "@/app/_services/test-cycle.service";
import { ITestCycle } from "@/app/_interface/test-cycle";
import { formatDateWithoutTime } from "@/app/_constants/date-formatter";
import EditIssue from "./_components/edit-issue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Helper function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, '').trim();
};

export default function Issues() {
  const [issues, setIssues] = useState<IIssueView[]>([]);
  const [userData, setUserData] = useState<any>();
  const [project, setProject] = useState<IProject>();
  const { projectId } = useParams<{ projectId: string }>();
  const checkProjectRole = checkProjectAdmin(project as IProject, userData);
  const [allIssues, setAllIssues] = useState<IIssueView[]>([]);


  const showIssueRowActions = (issue: IIssue) => {
    // Crowd testers cannot edit any issues
    if (userData?.role === UserRoles.CROWD_TESTER) {
      return false;
    }

    return (
      (checkProjectRole && project?.isActive) ||
      (project?.isActive &&
        issue.userId?._id?.toString() === userData?._id?.toString()) ||
      userData?.role !== UserRoles.TESTER ||
      issue?.assignedTo?._id?.toString() === userData?._id?.toString()
    );
  };

  const columns: ColumnDef<IIssueView>[] = [
    {
      accessorKey: "customId",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="h-8 px-1 hover:bg-muted/80 justify-start"
          >
            <Bug className="mr-1 h-3 w-3" />
            <span className="font-semibold text-xs">ID</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <Link 
          href={`/private/browse/${projectId}/issue/${row.original?.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center space-x-2 hover:text-primary text-primary cursor-pointer">
            <Bug className="h-3 w-3 flex-shrink-0" />
            <span className="font-medium text-xs">
              {row.getValue("customId")}
            </span>
          </div>
        </Link>
      ),
      sortingFn: "alphanumeric",
      size: 70,
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="h-8 px-1 hover:bg-muted/80 justify-start"
          >
            <span className="font-semibold text-xs">Title</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const title = row.getValue("title");
        if (typeof title === "string") {
          return (
            <Link
              href={`/private/browse/${projectId}/issue/${row.original?.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                title={title}
                className="hover:text-primary cursor-pointer text-xs max-w-[600px] sm:max-w-[800px] whitespace-normal break-words"
                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {title}
              </div>
            </Link>
          );
        }
      },
    },
    {
      accessorKey: "severity",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="h-8 px-1 hover:bg-muted/80"
          >
            <AlertTriangle className="mr-1 h-3 w-3" />
            <span className="font-semibold text-xs">Severity</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const severity = row.getValue("severity") as string;
        const severityColors = {
          Blocker: "bg-red-900 text-red-100 border-red-700",
          Critical: "bg-red-100 text-red-800 border-red-200",
          Major: "bg-purple-100 text-purple-800 border-purple-200",
          High: "bg-orange-100 text-orange-800 border-orange-200",
          Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
          Minor: "bg-blue-100 text-blue-800 border-blue-200",
          Low: "bg-green-100 text-green-800 border-green-200",
          Trivial: "bg-gray-100 text-gray-800 border-gray-200",
        };
        return (
          <Badge
            variant="outline"
            className={`text-xs capitalize ${severityColors[severity as keyof typeof severityColors] || 'bg-gray-100 text-gray-800'}`}
          >
            {severity}
          </Badge>
        );
      },
      size: 90,
    },
    {
      accessorKey: "priority",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="h-8 px-1 hover:bg-muted/80"
          >
            <BarChart3 className="mr-1 h-3 w-3" />
            <span className="font-semibold text-xs">Priority</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <span className="text-xs">{displayIcon(row.getValue("priority"))}</span>
          <span className="text-xs capitalize">{row.getValue("priority")}</span>
        </div>
      ),
      size: 90,
    },
    {
      accessorKey: "Test Cycle",
      header: () => <span className="font-semibold text-xs">Test Cycle</span>,
      cell: ({ row }) => {
        const testCycle = row.original?.testCycle?.title;
        return (
          <div className="text-xs truncate max-w-[120px]" title={testCycle}>
            {testCycle || 'Not assigned'}
          </div>
        );
      },
      size: 120,
    },
    ...(userData?.role === UserRoles.ADMIN
      ? [
        {
          accessorKey: "createdBy",
          header: ({ column }: { column: any }) => {
            const isSorted = column.getIsSorted();
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(isSorted === "asc")}
                className="h-8 px-1 hover:bg-muted/80 hidden md:flex"
              >
                <User className="mr-1 h-3 w-3" />
                <span className="font-semibold text-xs">Reporter</span>
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            );
          },
          cell: ({ row }: { row: any }) => {
            const user = row.original?.userId;
            const firstName = user?.firstName || "";
            const lastName = user?.lastName || "";
            const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
            const displayName = `${firstName} ${lastName}`.trim();

            return (
              <div className="items-center space-x-2 hidden md:flex">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarFallback className="text-xs bg-muted">
                    {initials || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs truncate max-w-[100px]">
                  {displayName || 'Unknown'}
                </span>
              </div>
            );
          },
          size: 130,
        },
      ]
      : []),
    ...(issues.some((item) => item.assignedTo?._id)
      ? [
        {
          accessorKey: "assignedTo",
          header: ({ column }: { column: any }) => {
            const isSorted = column.getIsSorted();
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(isSorted === "asc")}
                className="h-8 px-1 hover:bg-muted/80 hidden lg:flex"
              >
                <User className="mr-1 h-3 w-3" />
                <span className="font-semibold text-xs">Assignee</span>
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            );
          },
          cell: ({ row }: { row: any }) => {
            const assignee = row.original?.assignedTo;
            if (!assignee?._id) {
              return (
                <div className="items-center space-x-2 hidden lg:flex">
                  <span className="text-xs text-muted-foreground">Unassigned</span>
                </div>
              );
            }

            const firstName = assignee?.firstName || "";
            const lastName = assignee?.lastName || "";
            const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
            const displayName = userData?.role === UserRoles.ADMIN
              ? `${firstName} ${lastName}`.trim() || NAME_NOT_SPECIFIED_ERROR_MESSAGE
              : assignee?.customId;

            return (
              <div className="items-center space-x-2 hidden lg:flex">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarFallback className="text-xs bg-muted">
                    {initials || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs truncate max-w-[100px]">
                  {displayName}
                </span>
              </div>
            );
          },
          size: 130,
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
            className="h-8 px-1 hover:bg-muted/80 hidden sm:flex"
          >
            <Calendar className="mr-1 h-3 w-3" />
            <span className="font-semibold text-xs">Raised</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }: { row: any }) => (
        <div className="items-center space-x-1 hidden sm:flex">
          <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="text-xs">
            {formatDateWithoutTime(row.original.createdAt)}
          </span>
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(isSorted === "asc")}
            className="h-8 px-1 hover:bg-muted/80"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            <span className="font-semibold text-xs">Status</span>
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="max-w-[120px] truncate">
          {statusBadge(row.getValue("status"))}
        </div>
      ),
      sortingFn: "alphanumeric",
      size: 90,
    },
    {
      id: "actions",
      header: () => <span className="font-semibold text-xs">Actions</span>,
      cell: ({ row }: { row: any }) => {
        return (
          <>
            {showIssueRowActions(row.original) &&
              checkProjectActiveRole(project?.isActive ?? false, userData) ? (
              <IssueRowActions
                row={row as unknown as Row<IIssue>}
                refreshIssues={refreshIssues}
                onEditClick={(issues) => {
                  console.log(issues);
                  setEditIssue(issues);
                  setIsEditOpen(true);
                }}
              />
            ) : null}
          </>
        );
      },
      size: 60,
    },
  ];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);
  const [issue, setIssue] = useState<IIssue>();
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [selectedSeverity, setSelectedSeverity] = useState<string>(() => {
    return localStorage.getItem("selectedSeverity") || "";
  });
  const [selectedPriority, setSelectedPriority] = useState<string>(() => {
    return localStorage.getItem("selectedPriority") || "";
  });
  const [selectedStatus, setSelectedStatus] = useState<string>(() => {
    return localStorage.getItem("selectedStatus") || "";
  });
  const [selectedTestCycle, setSelectedTestCycle] = useState<string>(() => {
    return localStorage.getItem("selectedTestCycle") || "";
  });
  const [testCycles, setTestCycles] = useState<ITestCycle[]>([]);
  const [editIssue, setEditIssue] = useState<IIssue | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState<number>(() => {
    const entity = localStorage.getItem("entity");
    if (entity === DBModels.ISSUE) {
      return Number(localStorage.getItem("currentPage")) || 1;
    }
    return 1;
  });
  console.log("selectedTestCycle", selectedTestCycle);

  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const [isExcelLoading, setIsExcelLoading] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const { data } = useSession();

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

  useEffect(() => {
    localStorage.setItem("currentPage", pageIndex.toString());
    localStorage.setItem("entity", DBModels.ISSUE);
  }, [pageIndex]);

  // Persist filter states to localStorage
  useEffect(() => {
    localStorage.setItem("selectedSeverity", selectedSeverity);
  }, [selectedSeverity]);

  useEffect(() => {
    localStorage.setItem("selectedPriority", selectedPriority);
  }, [selectedPriority]);

  useEffect(() => {
    localStorage.setItem("selectedStatus", selectedStatus);
  }, [selectedStatus]);

  useEffect(() => {
    localStorage.setItem("selectedTestCycle", selectedTestCycle);
  }, [selectedTestCycle]);

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

  const getIssues = async () => {
    console.log('getIssues called with filters:', {
      selectedTestCycle,
      selectedSeverity,
      selectedPriority,
      selectedStatus,
      globalFilter
    });
    setIsLoading(true);
    try {
      const response = await getIssuesService(
        projectId,
        pageIndex,
        pageSize,
        globalFilter as unknown as string,
        selectedSeverity,
        selectedPriority,
        selectedStatus,
        selectedTestCycle
      );
      console.log('API response:', response);
      console.log('Issues count:', response?.issues?.length);
      setIssues(response?.issues);
      setTotalPageCount(response?.total);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
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

  const generateExcel = async () => {
    setIsExcelLoading(true);

    // Fetch all issues without pagination for export
    let allIssues: IIssueView[] = [];
    try {
      const response = await getIssuesService(
        projectId,
        1, // Start from page 1
        999999, // Large number to get all data
        globalFilter as unknown as string,
        selectedSeverity,
        selectedPriority,
        selectedStatus,
        selectedTestCycle
      );
      allIssues = response?.issues || [];
    } catch (error) {
      toasterService.error();
      setIsExcelLoading(false);
      return;
    }

    const header =
      userData?.role === UserRoles.ADMIN
        ? [
          "ID",
          "Title",
          "Description",
          "Severity",
          "Priority",
          "Issue Type",
          "Test Cycle",
          "Devices Name",
          "Created By",
          "Status",
          "Attachments",
        ]
        : [
          "ID",
          "Title",
          "Description",
          "Severity",
          "Priority",
          "Issue Type",
          "Test Cycle",
          "Devices Name",
          "Status",
          "Attachments",
        ];
    console.log('allIssues', allIssues[8]);
    const excelData = allIssues.map((issue) =>
      userData?.role === UserRoles.ADMIN
        ? [
          issue.customId || "",
          issue.title || "",
          stripHtmlTags(issue.description || ""),
          issue.severity || "",
          issue.priority || "",
          issue.issueType || "",
          issue.testCycle?.title || "",
          issue.device?.map((device: any) => device?.name).join(", ") || "",
          `${issue.userId?.firstName || ""} ${issue.userId?.lastName || ""
          }`,
          issue.status || "",
          issue.attachmentsList?.map((attachment: any) => attachment?.link).join(", ") || "",
        ]
        : [
          issue.customId || "",
          issue.title || "",
          stripHtmlTags(issue.description || ""),
          issue.severity || "",
          issue.priority || "",
          issue.issueType || "",
          issue.testCycle?.title || "",
          issue.device?.map((device: any) => device?.name).join(", ") || "",
          issue.status || "",
          issue.attachments?.map((attachment: any) => attachment?.name).join(", ") || "",
        ]
    );

    const ws = XLSX.utils.aoa_to_sheet([header, ...excelData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const safeFileName = `${project?.title || "Project"} Issues.xlsx`;
    saveAs(blob, safeFileName);
    setIsExcelLoading(false);
  };

  const hasData = issues.length > 0;

  const handleSeverityChange = (severity: Severity | "All") => {
    if (severity === "All") {
      setSelectedSeverity("");
    } else {
      setSelectedSeverity(severity);
    }
  };

  const handlePriorityChange = (priority: Priority | "All") => {
    if (priority === "All") {
      setSelectedPriority("");
    } else {
      setSelectedPriority(priority);
    }
  };

  const handleTestCycleChange = (TestCycle: string | "All") => {
    if (TestCycle === "All") {
      setSelectedTestCycle("");
    } else {
      setSelectedTestCycle(TestCycle);
    }
  };

  const handleStatusChange = (priority: IssueStatus | "All") => {
    if (priority === "All") {
      setSelectedStatus("");
    } else {
      setSelectedStatus(priority);
    }
  };

  const clearFilters = () => {
    setSelectedSeverity("");
    setSelectedPriority("");
    setSelectedStatus("");
    setSelectedTestCycle("");
    setGlobalFilter([]);
    setPageIndex(1);
  };

  const getTestCycle = async () => {
    try {
      const response = await getTestCycleListService(projectId);
      setTestCycles(response);
    } catch (error) {
      toasterService.error();
    }
  };

  // Fetch all issues for dashboard stats
  const getAllIssues = async () => {
    try {
      const response = await getIssuesService(
        projectId,
        1, // page 1
        999999, // large page size to get all
        globalFilter as unknown as string,
        selectedSeverity,
        selectedPriority,
        selectedStatus,
        selectedTestCycle
      );
      setAllIssues(response?.issues || []);
    } catch (error) {
      setAllIssues([]);
    }
  };

  useEffect(() => {
    getProject();
    getTestCycle();
    // Don't call getAllIssues and getIssues here - wait for filter states to be restored
  }, []);

  // Initial data fetch after component mounts with restored filter states
  useEffect(() => {
    // This runs after the component mounts and filter states are initialized
    if (project && testCycles.length > 0 && isInitialLoad) {
      console.log('Initial load with filters:', {
        selectedTestCycle,
        selectedSeverity,
        selectedPriority,
        selectedStatus
      });
      setIsInitialLoad(false);
      getIssues();
      getAllIssues();
    }
  }, [project, testCycles, isInitialLoad]);

  // Handle filter changes (when user actually changes filters)
  useEffect(() => {
    // Only run if we have the project and test cycles loaded, and this is not the initial load
    if (project && testCycles.length > 0 && !isInitialLoad) {
      setIsLoading(true);
      getIssues();
      getAllIssues();
    }
  }, [selectedSeverity, selectedPriority, selectedStatus, selectedTestCycle]);

  // Debounced fetch for search and pagination changes
  useEffect(() => {
    if (!isInitialLoad) {
      const debounceFetch = setTimeout(() => {
        getIssues();
        getAllIssues();
      }, 500);
      return () => clearTimeout(debounceFetch);
    }
  }, [globalFilter, pageIndex, pageSize, isInitialLoad]);

  useEffect(() => {
    if (
      (Array.isArray(globalFilter) && globalFilter.length > 0) ||
      (typeof globalFilter === "string" && globalFilter.trim() !== "")
    ) {
      setPageIndex(1);
    }
  }, [globalFilter]);

  // Monitor issues state changes
  useEffect(() => {
    console.log('Issues state updated:', {
      issuesCount: issues.length,
      selectedTestCycle,
      isLoading
    });
  }, [issues, selectedTestCycle, isLoading]);

  // Calculate statistics from allIssues
  const criticalIssues = allIssues.filter(issue => issue.severity === 'Critical').length;
  const openIssues = allIssues.filter(issue => issue.status === 'Open' || issue.status === 'New').length;
  const resolvedIssues = allIssues.filter(issue => issue.status === 'Resolved' || issue.status === 'Closed').length;
  const highPriorityIssues = allIssues.filter(issue => issue.priority === 'High').length;

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
        <ViewIssue
          issue={issue as IIssue}
          sheetOpen={isViewOpen}
          setSheetOpen={setIsViewOpen}
        />

        {editIssue && (
          <EditIssue
            key={editIssue.id}
            issue={editIssue as IIssue}
            sheetOpen={isEditOpen}
            setSheetOpen={setIsEditOpen}
            refreshIssues={refreshIssues}
          />
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
              Project Issues
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Problems or defects discovered during testing that need resolution
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div>
              {ExportExcelFile(generateExcel, hasData, isExcelLoading, false)}
            </div>
            {userData?.role !== UserRoles.CLIENT &&
              userData?.role !== UserRoles.MANAGER &&
              userData?.role !== UserRoles.DEVELOPER &&
              checkProjectActiveRole(project?.isActive ?? false, userData) &&
              (project?.isActive === true ||
                userData?.role === UserRoles.ADMIN ||
                userData?.role === UserRoles.TESTER ||
                userData?.role === UserRoles.CROWD_TESTER) && (
                <AddIssue refreshIssues={refreshIssues} />
              )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Issues</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{allIssues.length}</div>
              <p className="text-xs text-muted-foreground">All reported issues</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Critical Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600">{criticalIssues}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Open Issues</CardTitle>
              <Activity className="h-4 w-4 text-orange-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{openIssues}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{resolvedIssues}</div>
              <p className="text-xs text-muted-foreground">Completed issues</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative min-w-0">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search issues by title, ID..."
                    value={(globalFilter as string) ?? ""}
                    onChange={(event) => {
                      setGlobalFilter(event.target.value);
                    }}
                    className="pl-9 h-10 w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <Select
                  value={selectedSeverity || "All"}
                  onValueChange={(value) => {
                    handleSeverityChange(value as Severity);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="All" key="all-severity">
                        All Severity
                      </SelectItem>
                      {SEVERITY_LIST.map((severity) => (
                        <SelectItem value={severity} key={severity}>
                          {severity}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedPriority || "All"}
                  onValueChange={(value) => {
                    handlePriorityChange(value as Priority);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="All" key="all-priority">
                        All Priority
                      </SelectItem>
                      {PRIORITY_LIST.map((priority) => (
                        <SelectItem value={priority} key={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus || "All"}
                  onValueChange={(value) => {
                    handleStatusChange(value as IssueStatus);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="All" key="all-status">
                        All Status
                      </SelectItem>
                      {ISSUE_STATUS_LIST.map((status) => (
                        <SelectItem value={status} key={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedTestCycle || "All"}
                  onValueChange={(value) => {
                    handleTestCycleChange(value as string);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Test Cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="All" key="all-testCycle">
                        All Test Cycle
                      </SelectItem>
                      {testCycles.map((testCycle) => (
                        <SelectItem
                          value={testCycle?._id || ""}
                          key={testCycle?._id}
                        >
                          {testCycle?.title}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {(() => {
                const hasFilters =
                  (selectedSeverity && selectedSeverity !== '') ||
                  (selectedPriority && selectedPriority !== '') ||
                  (selectedStatus && selectedStatus !== '') ||
                  (selectedTestCycle && selectedTestCycle !== '') ||
                  (globalFilter && Array.isArray(globalFilter) && globalFilter.length > 0) ||
                  (globalFilter && typeof globalFilter === 'string' && globalFilter.trim() !== '');

                console.log('Filter values:', {
                  selectedSeverity,
                  selectedPriority,
                  selectedStatus,
                  selectedTestCycle,
                  globalFilter,
                  hasFilters
                });
                return hasFilters ? (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 px-3"
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : null;
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="w-full">
              <Table className="w-full">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-b bg-muted/50">
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} className="h-12 px-1 sm:px-2 whitespace-nowrap overflow-hidden" style={{ width: header.column.getSize() }}>
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
                          <TableCell key={cell.id} className="px-1 sm:px-2 py-3 whitespace-nowrap overflow-hidden" style={{ width: cell.column.getSize() }}>
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
                              <p className="text-sm text-muted-foreground">Loading issues...</p>
                            </>
                          ) : (
                            <>
                              <Bug className="h-8 w-8 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">No issues found</p>
                              <p className="text-xs text-muted-foreground">Try adjusting your filters or create new issues</p>
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
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t bg-muted/25 gap-4">
              <div className="text-sm text-muted-foreground order-2 sm:order-1">
                Showing {issues.length} of {totalPageCount} issues
              </div>
              <div className="flex items-center space-x-2 order-1 sm:order-2">
                <p className="text-sm text-muted-foreground whitespace-nowrap">
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
    </div>
  );
}
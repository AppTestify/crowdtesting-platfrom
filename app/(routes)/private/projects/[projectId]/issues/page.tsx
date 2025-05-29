"use client";

import { useEffect, useState } from "react";
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
import { ArrowUpDown } from "lucide-react";
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

export default function Issues() {
  const [issues, setIssues] = useState<IIssueView[]>([]);
  const [userData, setUserData] = useState<any>();
  const [project, setProject] = useState<IProject>();
  const { projectId } = useParams<{ projectId: string }>();
  const checkProjectRole = checkProjectAdmin(project as IProject, userData);

  const showIssueRowActions = (issue: IIssue) => {
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
          >
            ID
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <Link href={`/private/browse/${projectId}/issue/${row.original?.id}`}>
          <div className="hover:text-primary text-primary cursor-pointer ml-4">
            {row.getValue("customId")}
          </div>
        </Link>
      ),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const title = row.getValue("title");
        if (typeof title === "string") {
          return (
            <Link
              href={`/private/browse/${projectId}/issue/${row.original?.id}`}
            >
              <div
                title={title}
                className="hover:text-primary cursor-pointer max-w-[500px] truncate"
              >
                {title.length > 50 ? `${title.substring(0, 50)}...` : title}
              </div>
            </Link>
          );
        }
      },
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("severity")}</div>
      ),
    },
    {
      accessorKey: "priority",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Priority
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize flex items-center">
          <span className="mr-1">{displayIcon(row.getValue("priority"))}</span>
          {row.getValue("priority")}
        </div>
      ),
    },
    {
      accessorKey: "Test Cycle",
      header: "Test cycle",
      cell: ({ row }) => {
        const testCycle = row.original?.testCycle?.title;
        return (
          <div className="capitalize" title={testCycle}>
            {testCycle?.length > 30
              ? `${testCycle?.substring(0, 30)}...`
              : testCycle}
          </div>
        );
      },
    },
    ...(userData?.role === UserRoles.ADMIN
      ? [
          {
            accessorKey: "createdBy",
            header: "Reporter",
            cell: ({ row }: { row: any }) => (
              <div className="">
                {`${row.original?.userId?.firstName || ""} ${
                  row.original?.userId?.lastName || ""
                }`}
              </div>
            ),
          },
        ]
      : []),
    ...(issues.some((item) => item.assignedTo?._id)
      ? [
          {
            accessorKey: "assignedTo",
            header: "Assignee",
            cell: ({ row }: { row: any }) => (
              <div>
                {row.original?.assignedTo?._id ? (
                  userData?.role === UserRoles.ADMIN ? (
                    `${
                      row.original?.assignedTo?.firstName ||
                      NAME_NOT_SPECIFIED_ERROR_MESSAGE
                    } ${row.original?.assignedTo?.lastName || ""}`
                  ) : (
                    row.original?.assignedTo?.customId
                  )
                ) : (
                  <span className="text-gray-400">Unassigned</span>
                )}
              </div>
            ),
          },
        ]
      : []),
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return <div className=" whitespace-nowrap">Raised Date</div>;
      },
      cell: ({ row }: { row: any }) => (
        <div className="whitespace-nowrap">
          {formatDateWithoutTime(row.original.createdAt)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize max-w-[200px] truncate ml-4">
          {statusBadge(row.getValue("status"))}
        </div>
      ),
      sortingFn: "alphanumeric",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: { row: any }) => {
        return (
          <>
            {showIssueRowActions(row.original) &&
            checkProjectActiveRole(project?.isActive ?? false, userData) ? (
              <IssueRowActions row={row} refreshIssues={refreshIssues} />
            ) : null}
          </>
        );
      },
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
  const [selectedSeverity, setSelectedSeverity] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedTestCycle, setSelectedTestCycle] = useState<string>("");
  const [testCycles, setTestCycles] = useState<ITestCycle[]>([]);
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
      setIssues(response?.issues);
      setTotalPageCount(response?.total);
    } catch (error) {
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
    const header =
      userData?.role === UserRoles.ADMIN
        ? [
            "ID",
            "Title",
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
            "Severity",
            "Priority",
            "Issue Type",
            "Test Cycle",
            "Devices Name",
            "Status",
            "Attachments",
          ];

    const response = await getIssuesService(
      projectId,
      1,
      totalPageCount,
      globalFilter as unknown as string,
      "",
      "",
      "",
      ""
    );
    const selectedTestCycleTitle = testCycles.find(
      (cycle) => cycle._id === selectedTestCycle
    )?.title;
    const data = response?.issues?.map((row: IIssue) => [
      row.customId,
      row.title,
      row.severity,
      row.priority,
      row.issueType,
      row.testCycle?.title || "",
      row.device?.map((deviceData) => deviceData?.name).join(", ") || "",
      userData?.role === UserRoles.ADMIN
        ? `${row.userId?.firstName} ${row.userId?.lastName}` || ""
        : row.status,
      userData?.role === UserRoles.ADMIN
        ? row.status || ""
        : row.attachments && row?.attachments?.length > 0
        ? process.env.NEXT_PUBLIC_URL +
          `/download/${projectId}/issue?issue=` +
          row.id
        : "",
      userData?.role === UserRoles.ADMIN
        ? row.attachments && row?.attachments?.length > 0
          ? process.env.NEXT_PUBLIC_URL +
            `/download/${projectId}/issue?issue=` +
            row.id
          : ""
        : "",
    ]);
    generateExcelFile(
      header,
      data,
      `Issues-${issues[0]?.projectId?.title}${
        selectedTestCycle ? `-${selectedTestCycleTitle}` : ""
      }.xlsx`
    );
    setIsExcelLoading(false);
  };
  const hasData = table.getRowModel().rows?.length > 0;

  const handleSeverityChange = (severity: Severity | "All") => {
    setPageIndex(1);
    if (severity == "All") {
      setSelectedSeverity("");
    } else {
      setSelectedSeverity(severity);
    }
  };

  const handlePriorityChange = (priority: Priority | "All") => {
    setPageIndex(1);
    if (priority == "All") {
      setSelectedPriority("");
    } else {
      setSelectedPriority(priority);
    }
  };

  const handleTestCycleChange = (TestCycle: string | "All") => {
    setPageIndex(1);
    if (TestCycle == "All") {
      setSelectedTestCycle("");
    } else {
      setSelectedTestCycle(TestCycle || "");
    }
  };

  const handleStatusChange = (priority: IssueStatus | "All") => {
    setPageIndex(1);
    if (priority == "All") {
      setSelectedStatus("");
    } else {
      setSelectedStatus(priority);
    }
  };

  const getTestCycle = async () => {
    try {
      const response = await getTestCycleListService(projectId);
      setTestCycles(response);
    } catch (error) {
      toasterService.error();
    }
  };

  useEffect(() => {
    getProject();
    getTestCycle();
  }, []);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      getIssues();
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [
    globalFilter,
    pageIndex,
    pageSize,
    selectedSeverity,
    selectedPriority,
    selectedStatus,
    selectedTestCycle,
  ]);

  useEffect(() => {
    if (
      (Array.isArray(globalFilter) && globalFilter.length > 0) ||
      (typeof globalFilter === "string" && globalFilter.trim() !== "")
    ) {
      setPageIndex(1);
    }
  }, [globalFilter]);

  return (
    <main className="mx-4 mt-2">
      <ViewIssue
        issue={issue as IIssue}
        sheetOpen={isViewOpen}
        setSheetOpen={setIsViewOpen}
      />
      <div className="">
        <h2 className="text-medium">Issues</h2>
        <span className="text-xs text-gray-600">
          Problems or defects discovered during testing that need resolution
          before the product is finalized.
        </span>
      </div>
      <div className="w-full">
        <div className="flex py-4 w-full justify-between">
          <Input
            placeholder="Filter Issues"
            value={(globalFilter as string) ?? ""}
            onChange={(event) => {
              setGlobalFilter(event.target.value);
            }}
            className="max-w-xs"
          />

          <div className="gap-2 ml-2">
            <Select
              value={selectedSeverity || "All"}
              onValueChange={(value) => {
                handleSeverityChange(value as Severity);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Search by severity" />
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
          </div>

          <div className="gap-2 ml-2">
            <Select
              value={selectedPriority || "All"}
              onValueChange={(value) => {
                handlePriorityChange(value as Priority);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Search by priority" />
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
          </div>

          <div className="gap-2 ml-2">
            <Select
              value={selectedStatus || "All"}
              onValueChange={(value) => {
                handleStatusChange(value as IssueStatus);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Search by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="All" key="all-status">
                    All Status
                  </SelectItem>
                  {(userData?.role === UserRoles.CLIENT
                    ? ISSUE_STATUS_LIST.filter(
                        (status) => status !== IssueStatus.NEW
                      )
                    : ISSUE_STATUS_LIST
                  ).map((status) => (
                    <SelectItem value={status} key={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="gap-2 ml-2">
            <Select
              value={selectedTestCycle || "All"}
              onValueChange={(value) => {
                handleTestCycleChange(value as string);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Search by test cycle" />
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

          <div className="flex items-end justify-end gap-2 ml-auto">
            <div>
              {ExportExcelFile(generateExcel, hasData, isExcelLoading, false)}
            </div>
            {userData?.role !== UserRoles.CLIENT &&
              userData?.role !== UserRoles.MANAGER &&
              userData?.role !== UserRoles.DEVELOPER &&
              checkProjectActiveRole(project?.isActive ?? false, userData) &&
              (project?.isActive === true ||
                userData?.role === UserRoles.ADMIN ||
                userData?.role === UserRoles.TESTER) && (
                <AddIssue refreshIssues={refreshIssues} />
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

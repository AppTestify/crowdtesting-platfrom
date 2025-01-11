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
import ExpandableTable from "@/app/_components/expandable-table";
import { checkProjectAdmin } from "@/app/_utils/common";
import { NAME_NOT_SPECIFIED_ERROR_MESSAGE } from "@/app/_constants/errors";

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
      userData?.role !== UserRoles.TESTER
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
              <div className="capitalize hover:text-primary cursor-pointer">
                {title.length > 30 ? `${title.substring(0, 30)}...` : title}
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
      accessorFn: (row) => row.device?.[0]?.name || "",
      accessorKey: "Device Name",
      header: "Device",
      cell: ({ row }) => (
        <div className="capitalize">
          {/* {row.original?.device && row.original.device.length > 0 ? row.original.device[0]?.name : ''} */}
          <ExpandableTable row={row?.original?.device} />
        </div>
      ),
    },
    ...(issues.some((item) => item.userId?._id)
      ? [
          {
            accessorKey: "createdBy",
            header: "Reporter",
            cell: ({ row }: { row: any }) => (
              <div className="">
                {`${row.original?.userId?.firstName} ${row.original?.userId?.lastName}`}
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
                  `${
                    row.original?.assignedTo?.firstName ||
                    NAME_NOT_SPECIFIED_ERROR_MESSAGE
                  } ${row.original?.assignedTo?.lastName || ""}`
                ) : (
                  <span className="text-gray-400">Unassigned</span>
                )}
              </div>
            ),
          },
        ]
      : []),
    {
      accessorKey: "status",
      header: ({ column }) => <div className="ml-1">Status</div>,
      cell: ({ row }) => (
        <div className="capitalize max-w-[200px] truncate">
          {statusBadge(row.getValue("status"))}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: { row: any }) => (
        <>
          {showIssueRowActions(row.original) ? (
            <IssueRowActions row={row} refreshIssues={refreshIssues} />
          ) : null}
        </>
      ),
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
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
  const { data } = useSession();

  useEffect(() => {
    if (data) {
      const { user } = data;
      setUserData(user);
    }
  }, [data]);

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
    getIssues();
    getProject();
  }, [pageIndex, pageSize]);

  const getIssues = async () => {
    setIsLoading(true);
    try {
      const response = await getIssuesService(projectId, pageIndex, pageSize);
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
      globalFilter,
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

  const generateExcel = () => {
    const header =
      userData.role === UserRoles.ADMIN
        ? [
            "ID",
            "Title",
            "Severity",
            "Priority",
            "issueType",
            "testCycle",
            "Device Name",
            "Created By",
            "Status",
            "Attachments",
          ]
        : [
            "ID",
            "Title",
            "Severity",
            "Priority",
            "issueType",
            "testCycle",
            "Device Name",
            "Status",
            "Attachments",
          ];
    const data = table
      .getRowModel()
      .rows?.map((row) => [
        row.original.customId,
        row.original.title,
        row.original.severity,
        row.original.priority,
        row.original.issueType,
        row.original.testCycle?.title || "",
        row.original.device?.[0]?.name || "",
        userData?.role === UserRoles.ADMIN
          ? `${row.original.userId?.firstName} ${row.original.userId?.lastName}` ||
            ""
          : row.original.status,
        userData?.role === UserRoles.ADMIN
          ? row.original.status || ""
          : row.original.attachments && row.original?.attachments?.length > 0
          ? process.env.NEXT_PUBLIC_URL +
            `/download/${projectId}/issue?issue=` +
            row.original.id
          : "",
        userData?.role === UserRoles.ADMIN
          ? row.original.attachments && row.original?.attachments?.length > 0
            ? process.env.NEXT_PUBLIC_URL +
              `/download/${projectId}/issue?issue=` +
              row.original.id
            : ""
          : "",
      ]);
    generateExcelFile(
      header,
      data,
      `Issues-${issues[0]?.projectId?.title}.xlsx`
    );
  };
  const hasData = table.getRowModel().rows?.length > 0;

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
        <div className="flex py-4 justify-between">
          <Input
            placeholder="Filter Issues"
            value={(globalFilter as string) ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(String(event.target.value));
            }}
            className="max-w-sm"
          />
          <div className="flex gap-2 ml-2">
            <div>{ExportExcelFile(generateExcel, hasData)}</div>
            {userData?.role !== UserRoles.CLIENT &&
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

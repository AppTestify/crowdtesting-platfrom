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
import { displayIcon, ExportExcelFile, statusBadge } from "@/app/_utils/common-functionality";
import { ArrowUpDown, FileSpreadsheet, FileText } from "lucide-react";
import { PAGINATION_LIMIT } from "@/app/_utils/common";
import ViewIssue from "./_components/view-issue";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import toasterService from "@/app/_services/toaster-service";
import { getProjectService } from "@/app/_services/project.service";
import { IProject } from "@/app/_interface/project";
import Link from "next/link";
import { generateExcelFile } from "@/app/_helpers/generate-excel.helper";

export default function Issues() {
  const [issues, setIssues] = useState<IIssueView[]>([]);
  const [userData, setUserData] = useState<any>();
  const [project, setProject] = useState<IProject>();
  const { projectId } = useParams<{ projectId: string }>();

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
        <Link href={`/private/project/${projectId}/issue/${row.original?.id}`}>
          <div className="hover:text-primary text-primary cursor-pointer ml-4"
          >
            {row.getValue("customId")}
          </ div>
        </Link>
      ),
      sortingFn: "alphanumeric"
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const title = row.getValue("title");
        if (typeof title === "string") {
          return (
            <Link href={`/private/project/${projectId}/issue/${row.original?.id}`}>
              <div className="capitalize hover:text-primary cursor-pointer" >
                {title.length > 30 ? `${title.substring(0, 30)}...` : title}
              </div>
            </Link>
          )
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
        )
      },
      cell: ({ row }) => (
        <div className="capitalize flex items-center">
          <span className="mr-1">
            {displayIcon(row.getValue("priority"))}
          </span>
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
          {row.original?.device && row.original.device.length > 0 ? row.original.device[0]?.name : ''}
        </div>
      ),
    },
    ...(
      issues.some((item) => item.userId?._id) ?
        [{
          accessorKey: "createdBy",
          header: "created By",
          cell: ({ row }: { row: any }) => (
            <div className="" >
              {`${row.original?.userId?.firstName} ${row.original?.userId?.lastName}`}</div>
          ),
        }] : []
    ),
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div className="ml-1">Status</div>
      ),
      cell: ({ row }) => (
        <div className="capitalize max-w-[200px] truncate">{statusBadge(row.getValue("status"))}</div>
      ),
    },
    // ...(
    //   ((project?.isActive === true && row.original?. === userData?.id) || userData?.role === UserRoles.ADMIN) ?
    //     [{
    //       id: "actions",
    //       enableHiding: false,
    //       cell: ({ row }: { row: any }) => (
    //         <IssueRowActions row={row} refreshIssues={refreshIssues} />
    //       ),
    //     }] : []
    // ),
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: { row: any }) => {
        if (
          (project?.isActive === true &&
            row.original?.userId?.toString() === userData?._id?.toString()) ||
          userData?.role === UserRoles.ADMIN || userData?.role === UserRoles.CLIENT
        ) {
          return <IssueRowActions row={row} refreshIssues={refreshIssues} />;
        }

        return null;
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
  }

  useEffect(() => {
    getIssues();
    getProject();
  }, [pageIndex, pageSize]);

  const getIssues = async () => {
    setIsLoading(true);
    const response = await getIssuesService(projectId, pageIndex, pageSize);
    setIssues(response?.issues);
    setTotalPageCount(response?.total);
    setIsLoading(false);
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

  const getIssue = async (data: IIssue) => {
    setIssue(data as IIssue);
    setIsViewOpen(true);
  };

  const handleNextPage = () => {
    if (pageIndex < Math.ceil(totalPageCount / pageSize)) {
      setPageIndex(pageIndex + 1);
    }
  };

  const generateExcel = () => {
    const header = userData.role === UserRoles.ADMIN ?
      ["ID", "Title", "Severity", "Priority", "issueType", "testCycle", "Device Name", "Created By", "Status"] :
      ["ID", "Title", "Severity", "Priority", "issueType", "testCycle", "Device Name", "Status"];
    const data = table.getRowModel().rows?.map((row) => [
      row.original.customId,
      row.original.title,
      row.original.severity,
      row.original.priority,
      row.original.issueType,
      row.original.testCycle?.title || "",
      row.original.device?.[0]?.name || "",
      userData?.role === UserRoles.ADMIN
        ? `${row.original.userId?.firstName} ${row.original.userId?.lastName}` || ""
        : row.original.status,
      userData?.role === UserRoles.ADMIN
        ? row.original.status || "" :
        ""
    ]);
    generateExcelFile(header, data, "Issues.xlsx");
  }
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
          Problems or defects discovered during testing that need resolution before the product is finalized.
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
            <div>
              {ExportExcelFile(generateExcel, hasData)}
            </div>
            {userData?.role !== UserRoles.CLIENT &&
              (project?.isActive === true || userData?.role === UserRoles.ADMIN) &&
              <AddIssue refreshIssues={refreshIssues} />
            }
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

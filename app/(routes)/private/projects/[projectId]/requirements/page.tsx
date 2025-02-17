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
import { useParams } from "next/navigation";
import { getRequirementsService } from "@/app/_services/requirement.service";
import { formatDistanceToNow } from "date-fns";
import { AddRequirement } from "./_components/add-requirement";
import { RequirementRowActions } from "./_components/row-actions";
import { IRequirement } from "@/app/_interface/requirement";
import ViewRequirement from "./_components/view-requirement";
import { ArrowUpDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { DBModels } from "@/app/_constants";
import { NAME_NOT_SPECIFIED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { checkProjectActiveRole, taskStatusBadge } from "@/app/_utils/common-functionality";
import { IProject } from "@/app/_interface/project";
import { getProjectService } from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";

export default function Issues() {
  const [requirements, setRequirements] = useState<IRequirement[]>([]);
  const [userData, setUserData] = useState<any>();
  const [project, setProject] = useState<IProject>();

  const columns: ColumnDef<IRequirement>[] = [
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
        <div
          className="text-primary cursor-pointer ml-4"
          onClick={() => getRequirement(row.original as IRequirement)}
        >
          {row.getValue("customId")}
        </div>
      ),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div
          className="capitalize hover:text-primary cursor-pointer"
          onClick={() => getRequirement(row.original as IRequirement)}
        >
          {row.getValue("title")}
        </div>
      ),
    },
    ...(userData?.role === UserRoles.ADMIN
      ? [
        {
          accessorKey: "createdBy",
          header: "Reporter",
          cell: ({ row }: { row: any }) => (
            <div className="">
              {`${row.original?.userId?.firstName || ""} ${row.original?.userId?.lastName || ""}`}
            </div>
          ),
        },
      ]
      : []),
    ...(Array.isArray(requirements) && requirements?.some((item) => item.assignedTo?._id)
      ? [
        {
          accessorKey: "assignedTo",
          header: "Assignee",
          cell: ({ row }: { row: any }) => (
            <div>
              {row.original?.assignedTo?._id ? (
                `${row.original?.assignedTo?.firstName ||
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
      accessorKey: "updatedAt",
      header: "Last updated",
      cell: ({ row }) => (
        <div className="capitalize">
          {formatDistanceToNow(new Date(row.getValue("updatedAt")), {
            addSuffix: true,
          })}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <div className="ml-1">Status</div>,
      cell: ({ row }) => (
        <div className="capitalize max-w-[200px] truncate">
          {taskStatusBadge(row.getValue("status"))}
        </div>
      ),
    },
    ...(
      userData?.role != UserRoles.TESTER && checkProjectActiveRole(project?.isActive ?? false, userData) ?
        [{
          id: "actions",
          enableHiding: false,
          cell: ({ row }: { row: any }) => (
            <RequirementRowActions
              row={row as Row<IRequirement>}
              refreshRequirements={refreshRequirements}
            />
          ),
        }] : [])
  ];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);
  const [pageIndex, setPageIndex] = useState<number>(() => {
    const entity = localStorage.getItem("entity");
    if (entity === DBModels.REQUIREMENT) {
      return Number(localStorage.getItem("currentPage")) || 1;
    }
    return 1;
  });
  const [requirement, setRequirement] = useState<IRequirement>();
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [isViewOpen, setIsViewOpen] = useState(false);
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
      getRequirements();
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [pageIndex, pageSize, globalFilter]);

  useEffect(() => {
    getProject();
  }, []);

  const getRequirement = async (data: IRequirement) => {
    setRequirement(data as IRequirement);
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

  const getRequirements = async () => {
    setIsLoading(true);
    const response = await getRequirementsService(
      projectId,
      pageIndex,
      pageSize,
      globalFilter as unknown as string
    );
    setRequirements(response?.requirements);
    setTotalPageCount(response?.total);
    setIsLoading(false);
  };

  const refreshRequirements = () => {
    getRequirements();
    setRowSelection({});
  };

  const table = useReactTable({
    data: requirements,
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
      // globalFilter,
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
    localStorage.setItem("currentPage", pageIndex.toString());
    localStorage.setItem("entity", DBModels.REQUIREMENT);
  }, [pageIndex]);

  return (
    <main className="mx-4 mt-2">
      <ViewRequirement
        requirement={requirement as IRequirement}
        sheetOpen={isViewOpen}
        setSheetOpen={setIsViewOpen}
      />
      <div className="">
        <h2 className="text-medium">Requirements</h2>
      </div>
      <div className="w-full">
        <div className="flex py-4 justify-between">
          <Input
            placeholder="Filter Requirements"
            value={(globalFilter as string) ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(String(event.target.value));
            }}
            className="max-w-sm"
          />
          {userData?.role != UserRoles.TESTER && checkProjectActiveRole(project?.isActive ?? false, userData) &&
            <div className="flex gap-2 ml-2">
              <AddRequirement refreshRequirements={refreshRequirements} />
            </div>
          }
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
                      <TableCell key={cell.id}
                        className={`${userData?.role != UserRoles.TESTER ? "" : "py-3"}`}
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

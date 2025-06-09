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
import { formatDate } from "@/app/_constants/date-formatter";
import { ITestPlan, ITestPlanPayload } from "@/app/_interface/test-plan";
import { getTestPlanService } from "@/app/_services/test-plan.service";
import { AddTestPlan } from "./_components/add-test-plan";
import { TestPlansRowActions } from "./_components/row-actions";
import ViewTestPlan from "./_components/view-test-plan";
import { ArrowUpDown } from "lucide-react";
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

export default function TestPlan() {
  const [testPlans, setTestPlans] = useState<ITestPlanPayload[]>([]);
  const [userData, setUserData] = useState<any>();
  const [project, setProject] = useState<IProject>();

  const columns: ColumnDef<ITestPlanPayload>[] = [
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
          onClick={() => getTestPlan(row.original as unknown as ITestPlan)}
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
          onClick={() => getTestPlan(row.original as unknown as ITestPlan)}
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
                {`${row.original?.userId?.firstName || ""} ${
                  row.original?.userId?.lastName || ""
                }`}
              </div>
            ),
          },
        ]
      : []),
    ...(testPlans.some((item) => item.assignedTo?._id)
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
      header: "Created On",
      cell: ({ row }) => (
        <div className="capitalize">
          {formatDate(row.getValue("createdAt"))}
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
                onEditClick={(editPaln) => {
                  setEditPlan(editPaln);
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
  ];

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
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [pageIndex, pageSize, globalFilter]);

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
    setTestPlans(response?.testPlans);
    setTotalPageCount(response?.total);
    setIsLoading(false);
  };

  const refreshTestPlans = () => {
    getTestPlans();
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
    <main className="mx-4 mt-2">
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
      <div className="">
        <h2 className="text-medium">Test plans</h2>
      </div>
      <div className="w-full">
        <div className="flex py-4 justify-between">
          <Input
            placeholder="Filter test plans"
            value={(globalFilter as string) ?? ""}
            onChange={(event) => {
              table.setGlobalFilter(String(event.target.value));
            }}
            className="max-w-sm"
          />
          {userData?.role !== UserRoles.TESTER &&
            checkProjectActiveRole(project?.isActive ?? false, userData) && (
              <div className="flex gap-2 ml-2">
                <AddTestPlan
                  refreshTestPlans={refreshTestPlans}
                  userData={userData}
                />
              </div>
            )}
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
              {table &&
              table.getRowModel() &&
              table?.getRowModel()?.rows?.length ? (
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

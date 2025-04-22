"use client"

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
import { useParams } from "next/navigation";
import { getProjectService, getProjectUsersPaginationService } from "@/app/_services/project.service";
import { AddProjectUser } from "./add-user";
import { ProjectUserRowActions } from "./row-actions";
import { IProject, IProjectUserDisplay } from "@/app/_interface/project";
import { statusBadgeProjectUserRole } from "@/app/_utils/common-functionality";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import ExpandableTable from "@/app/_components/expandable-table";
import { DBModels } from "@/app/_constants";
import { Button } from "@/components/ui/button";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { checkProjectAdmin } from "@/app/_utils/common";
import toasterService from "@/app/_services/toaster-service";
import UserVerify from "./user-verify";

export default function ProjectUsers() {
    const [userData, setUserData] = useState<any>();
    const [project, setProject] = useState<IProject>();
    const projectAdmin = checkProjectAdmin(project as IProject, userData);

    const columns: ColumnDef<IProjectUserDisplay>[] = [
      {
        accessorFn: (row) => row.userId?.firstName || row.userId?.lastName || "",
        accessorKey: "userName",
        header: "Tester Identification Number",
        cell: ({ row }) => {
          const firstName = row?.original?.userId?.firstName;
          const lastName = row?.original?.userId?.lastName;
          return (
            <div className="capitalize">
              <div>
                {firstName && lastName ? `${firstName} ${lastName}` : ""}
              </div>
            </div>
          );
        },
      },
      {
        accessorFn: (row) =>
          row?.tester?.skills?.filter((skill) => skill.trim() !== "").join(", ") || "",
        accessorKey: "skills",
        header: "Skills",
        cell: ({ row }) => {
          const skills = row.original?.tester?.skills;
          const filteredSkills = skills
            ?.filter((skill) => skill.trim() !== "")
            .map((skill) => ({ name: skill }));
          return (
            <div>
              <ExpandableTable row={filteredSkills as any[]} />
            </div>
          );
        },
      },
      {
        accessorFn: (row) =>
          row.tester?.languages
            ?.filter((lang) => lang.name.trim() !== "")
            .map((lang) => lang.name)
            .join(", ") || "",
        accessorKey: "language",
        header: "Language",
        cell: ({ row }) => (
          <div className="capitalize">
            <ExpandableTable row={row.original.tester?.languages as any[]} />
          </div>
        ),
        filterFn: (row, columnId, filterValue) => {
          const languages = row.original?.tester?.languages || [];
          return languages.some((language) =>
            language?.name?.toLowerCase().includes(filterValue.toLowerCase())
          );
        },
      },
      {
        accessorFn: (row) => row.role || "",
        accessorKey: "projectUserRole",
        header: "Role",
        cell: ({ row }) => (
          <div className="capitalize">
            {statusBadgeProjectUserRole(row.original?.role)}
          </div>
        ),
      },
      {
        accessorFn: (row) => row.tester?.address?.city || "",
        accessorKey: "city",
        header: "City",
        cell: ({ row }) => (
          <div className="capitalize">
            {row.original?.tester?.address?.city}
          </div>
        ),
      },
      {
        accessorFn: (row) => row.tester?.address?.country || "",
        accessorKey: "country",
        header: "Country",
        cell: ({ row }) => (
          <div className="capitalize">
            {row.original?.tester?.address?.country}
          </div>
        ),
      },
      ...(projectAdmin === true || userData?.role === UserRoles.ADMIN
        ? [
            {
              accessorKey: "verify",
              header: "Verify",
              cell: ({ row }: { row: any }) => {
                const isVerify = row.original?.isVerify ?? true;
                return (
                  <div className="capitalize">
                    <UserVerify
                      status={isVerify}
                      id={row.original._id as string}
                      projectId={projectId as string}
                      refreshProjectUsers={refreshProjectUsers}
                    />
                  </div>
                );
              },
            },
          ]
        : []),
      ...(userData?.role === UserRoles.ADMIN
        ? [
            {
              id: "actions",
              enableHiding: false,
              cell: ({ row }: { row: any }) => (
                <ProjectUserRowActions
                  row={row}
                  projectId={projectId}
                  refreshProjectUsers={refreshProjectUsers}
                />
              ),
            },
          ]
        : []),
    ];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [pageIndex, setPageIndex] = useState<number>(() => {
        const entity = localStorage.getItem("entity");
        if (entity === DBModels.USER) {
            return Number(localStorage.getItem("currentPage")) || 1;
        }
        return 1;
    });
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [projectUsers, setProjectUsers] = useState<IProjectUserDisplay[]>([]);
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
    const { projectId } = useParams<{ projectId: string }>();
    const { data } = useSession();

    const handlePreviousPage = () => {
        if (pageIndex > 1) {
            setPageIndex(pageIndex - 1);
        }
    };

    const handleNextPage = () => {
        const maxPage = Math.ceil(totalPageCount / pageSize);
        if (pageIndex < maxPage) {
            setPageIndex((prev) => prev + 1);
        }
    };

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    useEffect(() => {
        localStorage.setItem("entity", DBModels.PROJECT_USERS);
        getProject();
    }, []);

    useEffect(() => {
        const debounceFetch = setTimeout(() => {
            getProjectUsers();
        }, 500);
        return () => clearTimeout(debounceFetch);

    }, [pageIndex, pageSize])

    const getProjectUsers = async () => {
        setIsLoading(true);
        const projectUsers = await getProjectUsersPaginationService(projectId, pageIndex, pageSize);
        setProjectUsers(projectUsers?.data?.users);
        setTotalPageCount(projectUsers?.data?.total);
        setIsLoading(false);
    };

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

    const refreshProjectUsers = () => {
        getProjectUsers();
        setRowSelection({});
    };

    const table = useReactTable({
        data: projectUsers,
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

    return (
        <main className="mx-4 mt-2">
            <div className="">
                <h2 className="text-medium">Users</h2>
            </div>
            <div className="w-full">
                <div className="flex items-center py-4 justify-between">
                    <Input
                        placeholder="Filter Users"
                        value={(globalFilter as string) ?? ""}
                        onChange={(event) => {
                            table.setGlobalFilter(String(event.target.value));
                        }}
                        className="max-w-sm"
                    />
                    {userData?.role === UserRoles.ADMIN &&
                        <div className="flex gap-2 ml-2">
                            <AddProjectUser refreshProjectUsers={refreshProjectUsers} />
                        </div>
                    }
                </div>
                <div className="rounded-md border mb-2">
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

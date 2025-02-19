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
import { useParams } from "next/navigation";
import {
    checkProjectActiveRole,
    displayIcon,
    taskStatusBadge,
} from "@/app/_utils/common-functionality";
import { ArrowUpDown } from "lucide-react";
import { useSession } from "next-auth/react";
import toasterService from "@/app/_services/toaster-service";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { NAME_NOT_SPECIFIED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { AddTask } from "./_components/add-task";
import { getTaskService } from "@/app/_services/task.service";
import { TaskRowActions } from "./_components/row-actions";
import { ITask } from "@/app/_interface/task";
import { DBModels } from "@/app/_constants";
import ExpandableTable from "@/app/_components/expandable-table";
import { IRequirement } from "@/app/_interface/requirement";
import { UserRoles } from "@/app/_constants/user-roles";
import Link from "next/link";
import { IProject } from "@/app/_interface/project";
import { getProjectService } from "@/app/_services/project.service";

export default function Tasks() {
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [userData, setUserData] = useState<any>();
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<IProject>();

    const showTaskRowActions = (task: ITask) => {
        return (
            (task.userId?._id?.toString() === userData?._id?.toString()) ||
            userData?.role !== UserRoles.TESTER ||
            (task?.assignedTo?._id?.toString() === userData?._id?.toString())
        );
    };


    const columns: ColumnDef<ITask>[] = [
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => {
                const title = row.getValue("title");
                if (typeof title === "string") {
                    return (
                        <Link href={`/private/browse/${projectId}/task/${row.original?.id}`}>
                            <div
                                title={title}
                                className="capitalize hover:text-primary cursor-pointer">
                                {title.length > 30 ? `${title.substring(0, 30)}...` : title}
                            </div>
                        </Link>
                    );
                }
            },
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
            accessorKey: "issueId",
            header: "Issue",
            cell: ({ row }: { row: any }) => {
                const issueTitle = row.original?.issueId?.title;
                return (
                    <div title={issueTitle}
                        className="capitalize"
                    >
                        {issueTitle?.length > 30 ? `${issueTitle?.substring(0, 30)}...` : issueTitle}
                    </div>
                )
            },
        },
        {
            accessorKey: "requirementIds",
            header: "Requirement",
            cell: ({ row }: { row: any }) => (
                <div className="capitalize">
                    <ExpandableTable row={row?.original?.requirementIds as IRequirement[]} />
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
                            {`${row.original?.userId?.firstName} ${row.original?.userId?.lastName}`}
                        </div>
                    ),
                }] : []
        ),
        {
            accessorKey: "assignedTo",
            header: "Assignee",
            cell: ({ row }: { row: any }) => (
                <div>
                    {row.original?.assignedTo?._id ? (
                        userData?.role === UserRoles.ADMIN ?
                            `${row.original?.assignedTo?.firstName ||
                            NAME_NOT_SPECIFIED_ERROR_MESSAGE
                            } ${row.original?.assignedTo?.lastName || ""}` :
                            row.original?.assignedTo?.customId
                    ) : (
                        <span className="text-gray-400">Unassigned</span>
                    )}
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
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }: { row: any }) => (
                <>
                    {showTaskRowActions(row.original) && checkProjectActiveRole(project?.isActive ?? false, userData) ? (
                        <TaskRowActions row={row} refreshTasks={refreshTasks} userData={userData} />
                    ) : null}
                </>
            ),
        }

    ];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [isViewOpen, setIsViewOpen] = useState<boolean>(false);
    const [task, setTask] = useState<ITask>();
    const [pageIndex, setPageIndex] = useState<number>(() => {
        const entity = localStorage.getItem("entity");
        if (entity === DBModels.TASK) {
            return Number(localStorage.getItem("currentPage")) || 1;
        }
        return 1;
    });
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
    const { data } = useSession();

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    const getTask = async (data: ITask) => {
        setTask(data as ITask);
        setIsViewOpen(true);
    };

    const getTasks = async () => {
        setIsLoading(true);
        try {
            const response = await getTaskService(projectId, pageIndex, pageSize, globalFilter as unknown as string);
            setTasks(response?.tasks);
            setTotalPageCount(response?.total);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    const refreshTasks = () => {
        getTasks();
        setRowSelection({});
    };

    const table = useReactTable({
        data: tasks,
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
        getProject();
    }, []);

    useEffect(() => {
        localStorage.setItem("currentPage", pageIndex.toString());
        localStorage.setItem("entity", DBModels.TASK);
    }, [pageIndex]);

    useEffect(() => {
        const debounceFetch = setTimeout(() => {
            getTasks();
        }, 500);
        return () => clearTimeout(debounceFetch);
    }, [globalFilter, pageIndex, pageSize]);

    useEffect(() => {
        if ((Array.isArray(globalFilter) && globalFilter.length > 0) || (typeof globalFilter === 'string' && globalFilter.trim() !== "")) {
            setPageIndex(1);
        }
    }, [globalFilter]);

    return (
        <main className="mx-4 mt-2">
            <div className="">
                <h2 className="text-medium">Tasks</h2>
            </div>
            <div className="w-full">
                <div className="flex py-4 justify-between">
                    <Input
                        placeholder="Filter tasks"
                        value={(globalFilter as string) ?? ""}
                        onChange={(event) => {
                            setGlobalFilter(event.target.value);
                        }}
                        className="max-w-sm"
                    />
                    {/* {userData?.role !== UserRoles.TESTER && */}
                    {checkProjectActiveRole(project?.isActive ?? false, userData) &&
                        <AddTask refreshTasks={refreshTasks} />
                    }
                    {/* // } */}
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

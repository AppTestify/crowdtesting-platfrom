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
import toasterService from "@/app/_services/toaster-service";
import { getReportsService } from "@/app/_services/report.service";
import { IReport, IReportAttachmentDisplay, IReportPayload } from "@/app/_interface/report";
import { IProject } from "@/app/_interface/project";
import { getProjectService } from "@/app/_services/project.service";
import { UserRoles } from "@/app/_constants/user-roles";
import { useSession } from "next-auth/react";
import { PAGINATION_LIMIT } from "@/app/_constants/pagination-limit";
import { AddReport } from "./_components/add-report";
import ViewReport from "./_components/view-report";
import { ReportRowActions } from "./_components/row-actions";
import ExpandableTable from "@/app/_components/expandable-table";
import { Download, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Report() {
    const [reports, setReports] = useState<IReport[]>([]);
    const [project, setProject] = useState<IProject>();
    const [userData, setUserData] = useState<any>();
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [report, setReport] = useState<IReport>();
    const [isDownloadLoading, setIsDownloadLoading] = useState<boolean>(false);

    const columns: ColumnDef<IReport>[] = [
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="capitalize hover:text-primary cursor-pointer"
                    onClick={() => openView(row.original as IReport)}>
                    {row.getValue("title")}
                </div>
            ),
        },
        {
            accessorKey: "descripiton",
            header: "Description",
            cell: ({ row }) => (
                <div
                    title={row.getValue("descripiton")}
                    className="capitalize w-32 overflow-hidden text-ellipsis line-clamp-2"
                    dangerouslySetInnerHTML={{
                        __html: row.original?.description || "",
                    }}
                />
            ),
        },
        {
            accessorKey: "attachments",
            header: "Attachments",
            cell: ({ row }) => (
                <div>
                    <ExpandableTable row={row?.original?.attachments as unknown as IReportAttachmentDisplay[]} />
                </div>
            ),
        },
        ...(
            reports.some((item) => item?.userId?._id) ?
                [{
                    accessorKey: "createdBy",
                    header: "Created By",
                    cell: ({ row }: { row: any }) => (
                        <div className="">
                            {row.original?.userId?.firstName && row.original?.userId?.lastName
                                ? `${row.original.userId.firstName} ${row.original.userId.lastName}`
                                : ""}
                        </div>
                    ),
                }] : []
        ),
        {
            accessorKey: "createdAt",
            header: "Created On",
            cell: ({ row }) => (
                <div className="capitalize">
                    {formatDate(row.getValue("createdAt"))}
                </div>
            ),
        },
        {
            accessorKey: "download",
            header: "  ",
            cell: ({ row }) => (
                <TooltipProvider>
                    <Tooltip delayDuration={50}>
                        <TooltipTrigger asChild>
                            <Button disabled={isDownloadLoading} variant={'outline'} size={'icon'} onClick={() => downloadAttachmentZip(row.original._id)}>
                                {isDownloadLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="w-5 h-5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Downlaod attachments</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

            ),
        },
        ...(
            (project?.isActive === true ||
                (userData?.role === UserRoles.ADMIN)) && userData?.role !== UserRoles.TESTER ?
                [{
                    id: "actions",
                    enableHiding: false,
                    cell: ({ row }: { row: any }) => (
                        <ReportRowActions row={row as Row<IReport>} refreshReports={refreshReports} />
                    ),
                }] : []
        ),
    ];

    // download zip file
    const downloadAttachmentZip = async (reportId: string) => {
        setIsDownloadLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_URL}/api/project/${projectId}/report/${reportId}/download-zip`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'images.zip';
                link.click();
            } else {
                console.error('Failed to download the file, status:', response.status);
            }
        } catch (error) {
            console.error('Error downloading file:', error);
        } finally {
            setIsDownloadLoading(false);
        }
    };

    const openView = (report: IReport) => {
        setIsViewOpen(true);
        setReport(report);
    }

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
    const { projectId } = useParams<{ projectId: string }>();
    const { data } = useSession();

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
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    useEffect(() => {
        getProject();
    }, []);

    useEffect(() => {
        getReports();
    }, [pageIndex, pageSize]);

    const getReports = async () => {
        setIsLoading(true);
        try {
            const response = await getReportsService(projectId, pageIndex, pageSize);
            setReports(response?.Reports);
            setTotalPageCount(response?.total);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };


    const refreshReports = () => {
        getReports();
        setRowSelection({});
    };

    const table = useReactTable({
        data: reports,
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

    return (
        <main className="mx-4 mt-2">
            <ViewReport
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
                report={report as IReport}
            />
            <div className="">
                <h2 className="text-medium">Reports</h2>
            </div>
            <div className="w-full">
                <div className="flex py-4 justify-between">
                    <Input
                        placeholder="Filter report"
                        value={(globalFilter as string) ?? ""}
                        onChange={(event) => {
                            table.setGlobalFilter(String(event.target.value));
                        }}
                        className="max-w-sm"
                    />
                    {(project?.isActive === true || userData?.role === UserRoles.ADMIN) &&
                        <div className="flex gap-2 ml-2">
                            <AddReport refreshReports={refreshReports} />
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
                            {table && table.getRowModel() && table?.getRowModel()?.rows?.length ? (
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

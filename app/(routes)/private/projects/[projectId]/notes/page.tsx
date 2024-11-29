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
import { PAGINATION_LIMIT } from "@/app/_utils/common";
import { ITestCyclePayload } from "@/app/_interface/test-cycle";
import { formatDate } from "@/app/_constants/date-formatter";
import { AddNote } from "./_components/add-note";
import toasterService from "@/app/_services/toaster-service";
import { getNotesService } from "@/app/_services/note.service";

export default function TestPlan() {
    const [notes, setNotes] = useState<ITestCyclePayload[]>([]);

    const columns: ColumnDef<ITestCyclePayload>[] = [
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="capitalize hover:text-primary cursor-pointer">
                    {row.getValue("title")}</div>
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("description")}</div>
            ),
        },
        ...(
            notes.some((item) => item?.userId?._id) ?
                [{
                    accessorKey: "createdBy",
                    header: "Created By",
                    cell: ({ row }: { row: any }) => (
                        <div className="">{`${row.original?.userId?.firstName} ${row.original?.userId?.lastName}`}</div>
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
    ];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [globalFilter, setGlobalFilter] = useState<unknown>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
    const { projectId } = useParams<{ projectId: string }>();

    useEffect(() => {
        getNotes();
    }, [pageIndex, pageSize]);

    const getNotes = async () => {
        setIsLoading(true);
        try {
            const response = await getNotesService(projectId, pageIndex, pageSize);
            setNotes(response?.Notes);
            setTotalPageCount(response?.total);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };


    const refreshNotes = () => {
        getNotes();
        setRowSelection({});
    };

    const table = useReactTable({
        data: notes,
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
            <div className="">
                <h2 className="text-medium">Test cycle</h2>
                <span className="text-xs text-gray-600">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    cumque vel nesciunt sunt velit possimus sapiente tempore repudiandae fugit fugiat.
                </span>
            </div>
            <div className="w-full">
                <div className="flex py-4 justify-between">
                    <Input
                        placeholder="Filter test cycle"
                        value={(globalFilter as string) ?? ""}
                        onChange={(event) => {
                            table.setGlobalFilter(String(event.target.value));
                        }}
                        className="max-w-sm"
                    />
                    <div className="flex gap-2 ml-2">
                        <AddNote refreshNotes={refreshNotes} />
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

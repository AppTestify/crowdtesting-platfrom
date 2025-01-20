import { DocumentName } from "@/app/_components/document-name";
import { IIssueAttachmentDisplay } from "@/app/_interface/issue";
import toasterService from "@/app/_services/toaster-service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getTestCycleAttachmentsService } from "@/app/_services/test-cycle-attachment.service";
import { ITestCycleAttachment, TestCycleAttachmentsProps } from "@/app/_interface/test-cycle";
import { TestCycleAttachmentRowActions } from "../row-actions";

export default function TestCycleAttachments({ testCycleId, isUpdate, isView, setAttachmentsData }: TestCycleAttachmentsProps) {
    const columns: ColumnDef<ITestCycleAttachment>[] = [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => <div>{row.original.attachment._id}</div>,
        },
        {
            accessorKey: "data",
            header: "File data",
            cell: ({ row }) => <div>{row.original.attachment.data}</div>,
        },
        {
            accessorKey: "contentType",
            header: "contentType",
            cell: ({ row }) => <div>{row.original.attachment.contentType}</div>,
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div>
                    <DocumentName document={row.original.attachment} />
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <TestCycleAttachmentRowActions row={row} refreshAttachments={refreshAttachments}
                    testCycleId={testCycleId} isView={isView} />
            ),
        },
    ];

    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({
            id: false,
            data: false,
            contentType: false,
            name: true,
        });
    const [rowSelection, setRowSelection] = useState({});
    const [documents, setDocuments] = useState<IIssueAttachmentDisplay[]>([]);
    const [globalFilter, setGlobalFilter] = useState<any>([]);
    const { projectId } = useParams<{ projectId: string }>();
    const inputRef = useRef<HTMLInputElement | null>(null);

    const table = useReactTable({
        data: documents,
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map((file) => ({
                ...file,
                name: file.name,
                contentType: file.type,
                size: file.size,
                getValue: (key: string) => (key === "contentType" ? file.type : undefined),
            }));

            setAttachmentsData?.((prevFiles = []) => {
                const uniqueFiles = Array.from(e.target.files as any).filter(
                    (file: any) => !prevFiles.some((prevFile) => prevFile.name === file.name && prevFile.size === file.size)
                );
                return [...prevFiles, ...uniqueFiles];
            });

            setAttachments((prevAttachments = []) => {
                const uniqueAttachments = newFiles.filter(
                    (file) => !prevAttachments.some((prevFile) => prevFile.name === file.name && prevFile.size === file.size)
                );
                return [...prevAttachments, ...uniqueAttachments];
            });
        }
    };

    const refreshAttachments = () => {
        getAttachments();
        setRowSelection({});
    };

    useEffect(() => {
        if (isUpdate === true || isView === true) {
            getAttachments();
        }
    }, [!isUpdate]);

    const getAttachments = async () => {
        try {
            setIsViewLoading(true);
            const response = await getTestCycleAttachmentsService(projectId, testCycleId);
            setDocuments(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
    }

    const handleRemoveFile = (index: number) => {
        const updateFiles = attachments.filter((_, i) => i !== index);
        setAttachmentsData?.(updateFiles);
        setAttachments(updateFiles);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className={` ${isView ? '' : 'mt-3 mb-2'}`}>
            <div className="flex w-full items-center gap-2">
                {!isView ?
                    <>
                        <div className="w-full">
                            <Label htmlFor="attachments">Attachments</Label>
                            <Input
                                className="mt-2 opacity-0 cursor-pointer absolute w-0 h-0"
                                id="attachments"
                                type="file"
                                multiple
                                ref={inputRef}
                                onChange={handleFileChange}
                            />
                            <label
                                htmlFor="attachments"
                                className="flex mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer"
                            >
                                Choose Files
                            </label>
                        </div>
                    </>
                    : null

                }
            </div>
            <div className={` ${isView ? 'mt-3' : 'mt-6'} `}>
                {table.getRowModel().rows?.length ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableBody>
                                {table.getRowModel().rows.map((row) => (
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
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : isView ? (
                    <div className="rounded-md border">
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        {isViewLoading ? 'Loading' : 'No attachments found'}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                ) : isUpdate && isViewLoading ?
                    <div className="">
                        <Skeleton className="h-[70px] bg-gray-200 w-full rounded-xl" />
                    </div> : null
                }
            </div>
            {attachments.length > 0 &&
                <div className="mt-2">
                    New attachments
                    <div className="mt-4 rounded-md border">
                        <Table>
                            <TableBody>
                                {attachments?.length ? (
                                    attachments.map((attachment, index) => (
                                        <TableRow key={index}>
                                            <TableCell><DocumentName document={attachment} /></TableCell>
                                            <TableCell className="flex justify-end items-end mr-6">
                                                <Button type="button" onClick={() => handleRemoveFile(index)}
                                                    variant="ghost"
                                                    size="icon">
                                                    <Trash className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            No attachments found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            }
        </div >
    );
}

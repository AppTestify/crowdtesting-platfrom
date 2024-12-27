import { DocumentName } from "@/app/_components/document-name";
import { IIssueAttachmentDisplay, IssueAttachmentsProps } from "@/app/_interface/issue";
import { getIssueAttachmentsService } from "@/app/_services/issue-attachment.service";
import toasterService from "@/app/_services/toaster-service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AttachmentRowActions } from "../row-actions";
import { Button } from "@/components/ui/button";

export default function IssueAttachments({ issueId, isUpdate, isView, setAttachmentsData }: IssueAttachmentsProps) {
  const columns: ColumnDef<IIssueAttachmentDisplay>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
      accessorKey: "data",
      header: "File data",
      cell: ({ row }) => <div>{row.getValue("data")}</div>,
    },
    {
      accessorKey: "contentType",
      header: "contentType",
      cell: ({ row }) => <div>{row.getValue("contentType")}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <DocumentName document={row} />
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <AttachmentRowActions row={row} refreshAttachments={refreshAttachments}
          issueId={issueId} isView={isView} />
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
      const files = Array.from(e.target.files).map((file) => ({
        ...file,
        name: file.name,
        contentType: file.type,
        size: file.size,
        getValue: (key: string) => (key === "contentType" ? file.type : undefined),
      }));
      const newFiles = Array.from(e.target.files);
      setAttachmentsData?.(newFiles);
      setAttachments(files)
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
      const response = await getIssueAttachmentsService(projectId, issueId);
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
          <div className="text-center h-20">Loading</div> : null
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

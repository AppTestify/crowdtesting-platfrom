import { DocumentName } from "@/app/_components/document-name";
import { IIssueAttachmentDisplay, IssueAttachmentsProps } from "@/app/_interface/issue";
import { addIssueAttachmentsService, getIssueAttachmentsService } from "@/app/_services/issue-attachment.service";
import toasterService from "@/app/_services/toaster-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AttachmentRowActions } from "../row-actions";

export default function IssueAttachments({ issueId, isUpdate }: IssueAttachmentsProps) {
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
        <AttachmentRowActions row={row} refreshAttachments={refreshAttachments} issueId={issueId} />
      ),
    },
  ];

  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      setAttachments(Array.from(e.target.files));
    }
  };

  const refreshAttachments = () => {
    getAttachments();
    setRowSelection({});
  };

  const uploadAttachment = async () => {
    setIsLoading(true);
    try {
      const response = await addIssueAttachmentsService(projectId, issueId, { attachments: attachments });
      if (response) {
        getAttachments();
        toasterService.success(response.message);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getAttachments();
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

  return (
    <div className="mt-4">
      <div className="flex w-full items-center gap-2">
        <div className="w-full">
          <Label htmlFor="attachments">Attachments</Label>
          <Input
            className="mt-2"
            id="attachments"
            type="file"
            multiple
            onChange={handleFileChange}
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="attachments" className="invisible">
            Upload
          </Label>
          <Button
            disabled={isLoading || attachments.length === 0}
            className="mt-4"
            onClick={uploadAttachment}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? "Uploading" : "Upload"}
          </Button>
        </div>
      </div>
      <div className="mt-6 rounded-md border">
        <Table>
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
                  {!isViewLoading ? "No documents found" : "Loading"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

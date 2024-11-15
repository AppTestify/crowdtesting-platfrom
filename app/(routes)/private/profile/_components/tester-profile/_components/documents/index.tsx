"use client";

import React, { useEffect, useState } from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Download, Trash, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { RowActions } from "./_components/row-actions";
import { IDocument } from "@/app/_interface/document";
import { getFilesByUserIdService, getFilesByUserIdToAdminService } from "@/app/_services/file.service";
import AddDocument from "./_components/add-document";
import { MAX_DOCUMENTS_LIMIT } from "../../_constants";
import { DocumentName } from "@/app/_components/document-name";
import { FileType } from "./_components/file-type";
import { useMediaQuery } from "react-responsive";
import { MOBILE_BREAKPOINT } from "@/app/_constants/media-queries";

export default function Documents({ userId }: { userId?: string }) {
  const columns: ColumnDef<IDocument>[] = [
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
      accessorKey: "fileType",
      header: "Type",
      cell: ({ row }) => (
        <div>
          <FileType document={row} />
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <RowActions row={row} refreshDocuments={refreshDocuments} userId={userId} />
      ),
    },
  ];

  const isMobile = useMediaQuery({ query: MOBILE_BREAKPOINT });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      id: false,
      data: false,
      contentType: false,
      name: true,
      fileType: !isMobile,
    });
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState<boolean>(false);
  const [rowSelection, setRowSelection] = useState({});
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<any>([]);

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

  useEffect(() => {
    getDocuments();
  }, []);

  const getDocuments = async () => {
    setIsLoading(true);
    let documents;
    if (userId) {
      documents = await getFilesByUserIdToAdminService(userId);
    } else {
      documents = await getFilesByUserIdService();
    }
    setDocuments(documents);
    setIsLoading(false);
  };

  const refreshDocuments = () => {
    getDocuments();
    setRowSelection({});
  };

  return (
    <>
      <AddDocument
        isOpen={isAddDocumentOpen}
        setIsOpen={setIsAddDocumentOpen}
        refreshDocuments={refreshDocuments}
      />

      <main className="mt-4">
        <div>
          <h2 className={`text-lg ${userId ? 'mb-2' : ''}`}>Personal documents</h2>
          {!userId &&
            <span className="text-gray-500 text-xs">
              All your personal documents are stored here, you will find updated
              documents or create new one.
            </span>
          }
        </div>
        <div className="w-full">
          {!userId &&
            <div className="flex items-center py-4 justify-between">
              <Input
                placeholder="Filter documents"
                value={(globalFilter as string) ?? ""}
                onChange={(event) => {
                  table.setGlobalFilter(String(event.target.value));
                }}
                className="max-w-sm"
              />
              <Button
                className="ml-2"
                onClick={() => setIsAddDocumentOpen(true)}
                disabled={documents.length >= MAX_DOCUMENTS_LIMIT}
              >
                <Upload /> Upload document
              </Button>
            </div>
          }
          <div className="rounded-md border">
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
                      {!isLoading ? "No documents found" : "Loading"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {!userId &&
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                You can only have {MAX_DOCUMENTS_LIMIT} documents at once.
              </div>
            </div>
          }
        </div>
      </main>
    </>
  );
}

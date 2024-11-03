"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { IDevice } from "@/app/_interface/device";
import { IDocument } from "@/app/_interface/document";
import { deleteDeviceService } from "@/app/_services/device.service";
import {
  deleteFileService,
  getFileService,
} from "@/app/_services/file.service";
import toasterService from "@/app/_services/toaster-service";
import { Button } from "@/components/ui/button";
import { Row } from "@tanstack/react-table";
import { Download, Trash } from "lucide-react";
import { useState } from "react";
import { ContentType } from "../../_constants";
import { downloadDocument } from "@/app/_utils/common";

export function RowActions({
  row,
  refreshDocuments,
}: {
  row: Row<IDocument>;
  refreshDocuments: () => void;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileId = row.original.id as string;

  const deleteDocument = async () => {
    try {
      setIsLoading(true);
      const response = await deleteFileService(fileId);

      if (response?.message) {
        setIsLoading(false);
        refreshDocuments();
        setIsDeleteOpen(false);
        toasterService.success(response.message);
      }
    } catch (error) {
      toasterService.error();
      setIsDeleteOpen(false);
      console.log("Error > deleteDevice");
    }
  };

  const getFile = async () => {
    try {
      downloadDocument(
        row.getValue("contentType"),
        row.getValue("data"),
        row.getValue("name")
      );
    } catch (error) {
      toasterService.error();
      console.log("Error > getFile", error);
    }
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        title="Delete document"
        description="Are you sure you want delete this document?"
        isLoading={isLoading}
        successAction={deleteDocument}
        successLabel="Delete"
        successLoadingLabel="Deleting"
        successVariant={"destructive"}
      />

      <div className="flex justify-end pr-4">
        <Button variant="ghost" size="icon" onClick={() => getFile()}>
          <Download className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => {
            setIsDeleteOpen(true);
            setIsLoading(false);
          }}
          variant="ghost"
          size="icon"
        >
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </>
  );
}

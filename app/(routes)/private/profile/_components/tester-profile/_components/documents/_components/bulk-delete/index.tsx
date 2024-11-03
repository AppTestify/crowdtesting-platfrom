"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import {
  devicesBulkDeleteService
} from "@/app/_services/device.service";
import toasterService from "@/app/_services/toaster-service";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useState } from "react";

export function BulkDelete({
  ids,
  refreshDocuments,
}: {
  ids: string[];
  refreshDocuments: () => void;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const deleteDevice = async () => {
    try {
      setIsLoading(true);
      const response = await devicesBulkDeleteService({ ids });

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

  return (
    <>
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        title="Delete selected devices"
        description="Are you sure you want delete the selected devices?"
        isLoading={isLoading}
        successAction={deleteDevice}
        successLabel="Delete"
        successLoadingLabel="Deleting"
        successVariant={"destructive"}
      />

      <Button
        variant={"outline"}
        onClick={() => {
          setIsDeleteOpen(true);
          setIsLoading(false);
        }}
      >
        <Trash /> Delete devices
      </Button>
    </>
  );
}

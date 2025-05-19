"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { addonBulkDeleteService } from "@/app/_services/addon.service";
import toasterService from "@/app/_services/toaster-service";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useState } from "react";

export function BulkDeleteAddon({
  ids,
  refreshAddon,
}: {
  ids: string[];
  refreshAddon: () => void;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const deleteAddon = async () => {
    try {
      setIsLoading(true);
      const response = await addonBulkDeleteService({ ids });

      if (response?.message) {
        setIsLoading(false);
        refreshAddon();
        setIsDeleteOpen(false);
        toasterService.success(response.message);
      }
    } catch (error) {
      toasterService.error();
      setIsDeleteOpen(false);
    }
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        title="Delete selected Addon"
        description="Are you sure you want delete the selected Addon?"
        isLoading={isLoading}
        successAction={deleteAddon}
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
        <Trash /> Delete Addon
      </Button>
    </>
  );
}

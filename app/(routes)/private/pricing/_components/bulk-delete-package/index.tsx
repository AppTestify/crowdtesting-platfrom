"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { pricingBulkDeleteService } from "@/app/_services/package.service";
import toasterService from "@/app/_services/toaster-service";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useState } from "react";

export function BulkDeletePackage({
  ids,
  refreshPackages,
}: {
  ids: string[];
  refreshPackages: () => void;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const deletePricing = async () => {
    try {
      setIsLoading(true);
      const response = await pricingBulkDeleteService({ ids });

      if (response?.message) {
        setIsLoading(false);
        refreshPackages();
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
        title="Delete selected package"
        description="Are you sure you want delete the selected Package?"
        isLoading={isLoading}
        successAction={deletePricing}
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
        <Trash /> Delete Package
      </Button>
    </>
  );
}

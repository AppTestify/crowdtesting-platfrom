import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { Row } from "@tanstack/react-table";
import { IPackage } from "@/app/_interface/package";
import { deletePackageService } from "@/app/_services/package.service";
import toasterService from "@/app/_services/toaster-service";
import ViewPacakgeModel from "../view-package-model";
import EditPackage from "../edit-package";


export default function PackageRowAction({
  row,
refreshPackages,
 }: {
     row: Row<IPackage>;
     refreshPackages: () => void;
 }) 
{
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [view, setView] = useState(false);
  const [isDelete, setDelete] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pricingId = row.original.id as string;

  const deletePricing = async () => {
    try {
      setIsLoading(true);
      const response = await deletePackageService(pricingId);
      if (response?.message) {
        toasterService.success(response.message);
        refreshPackages();
      }
    } catch (error) {

      toasterService.error();
    } finally {
      setIsLoading(false);
      setDelete(false);
    }
  };

  return (
    <>
      
        <EditPackage
          packages={row.original as IPackage}
          sheetOpen={isEditOpen}
          setSheetOpen={setIsEditOpen}
          refreshPackages={refreshPackages}
        />

      <ViewPacakgeModel
        sheetOpen={view}
        packages={row.original}
        setSheetOpen={setView}
      />
      <ConfirmationDialog
        isOpen={isDelete}
        setIsOpen={setDelete}
        title="Delete selected package"
        description="Are you sure you want to delete the selected package?"
        isLoading={isLoading}
        successAction={deletePricing}
        successLabel="Delete"
        successLoadingLabel="Deleting"
        successVariant="destructive"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setView(true)}>
            <Eye className="h-4 w-4 mr-2" /> View
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setDelete(true)}>
            <Trash className="h-4 w-4 mr-2 text-destructive" />
            <span className="text-destructive">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

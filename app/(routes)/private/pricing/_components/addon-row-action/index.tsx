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
import ViewPricingModel from "../view-package-model";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { Row } from "@tanstack/react-table";
import { IPackage } from "@/app/_interface/package";
import toasterService from "@/app/_services/toaster-service";
import { deleteAddonService } from "@/app/_services/addon.service";
import ViewAddOn from "../view-addon";
import EditAddOnModel from "../edit-add-on";
import { IAddOn } from "@/app/_models/addon.model";
import { IAddon } from "@/app/_interface/addon";

export default function AddonRowAction({
  row,
  refreshAddon,
}: {
  row: Row<IAddon>;
  refreshAddon: () => void;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [view, setView] = useState(false);
  const [isDelete, setDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addonId = row.original.id as string;
  const deleteAddon = async () => {
    try {
      setIsLoading(true);
      const response = await deleteAddonService(addonId);
      if (response?.message) {
        toasterService.success(response.message);
        refreshAddon();
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
      <EditAddOnModel
        sheetOpen={isEditOpen}
        addon={row.original as IAddon}
        setSheetOpen={setIsEditOpen}
        refreshAddOn={refreshAddon}
      />
      <ViewAddOn
        sheetOpen={view}
        addon={row.original}
        setSheetOpen={setView}
        // refreshAddon={refreshAddon}
      />

      <ConfirmationDialog
        isOpen={isDelete}
        setIsOpen={setDelete}
        title="Delete selected Addon"
        description="Are you sure you want to delete the selected Addon?"
        isLoading={isLoading}
        successAction={deleteAddon}
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

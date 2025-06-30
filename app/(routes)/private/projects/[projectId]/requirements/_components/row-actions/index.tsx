"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { IRequirement } from "@/app/_interface/requirement";
import { deleteRequirementService } from "@/app/_services/requirement.service";
import toasterService from "@/app/_services/toaster-service";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Row } from "@tanstack/react-table";
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";

export function RequirementRowActions({
  row,
  refreshRequirements,
  onViewClick,
  onEditClick,
}: {
  row: Row<IRequirement>;
  refreshRequirements: () => void;
  onViewClick: (viewReq: IRequirement) => void;
  onEditClick: (editReq: IRequirement) => void;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const projectId = row.original.projectId as unknown as string;
  const requirementId = row.original.id as string;

  const deleteRequirement = async () => {
    try {
      setIsLoading(true);
      const response = await deleteRequirementService(projectId, requirementId);

      if (response?.message) {
        setIsLoading(false);
        refreshRequirements();
        setIsDeleteOpen(false);
        toasterService.success(response.message);
      }
    } catch (error) {
      toasterService.error();
      setIsDeleteOpen(false);
      console.log("Error > deleteRequirement");
    }
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        title="Delete requirement"
        description="Are you sure you want delete this requirement?"
        isLoading={isLoading}
        successAction={deleteRequirement}
        successLabel="Delete"
        successLoadingLabel="Deleting"
        successVariant={"destructive"}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="mb-1"
            onClick={() => onViewClick(row.original)}
          >
            <Eye className="h-2 w-2" /> View
          </DropdownMenuItem>
          <DropdownMenuSeparator className="border-b" />
          <DropdownMenuItem
            className="mb-1"
            onClick={() => onEditClick(row.original)}
          >
            <Edit className="h-2 w-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator className="border-b" />
          <DropdownMenuItem
            className="my-1"
            onClick={() => {
              setIsDeleteOpen(true);
              setIsLoading(false);
            }}
          >
            <Trash className="h-2 w-2 text-destructive" />{" "}
            <span className="text-destructive">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

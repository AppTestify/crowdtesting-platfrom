"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { IDevice } from "@/app/_interface/device";
import {
  deleteDeviceService,
  devicesBulkDeleteService,
} from "@/app/_services/device.service";
import { projectsBulkDeleteService } from "@/app/_services/project.service";
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
import { Edit, Loader2, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";

export function BulkDelete({
  ids,
  refreshProjects,
}: {
  ids: string[];
  refreshProjects: () => void;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const deleteProject = async () => {
    try {
      setIsLoading(true);
      const response = await projectsBulkDeleteService({ ids });

      if (response?.message) {
        setIsLoading(false);
        refreshProjects();
        setIsDeleteOpen(false);
        toasterService.success(response.message);
      }
    } catch (error) {
      toasterService.error();
      setIsDeleteOpen(false);
      console.log("Error > deleteProject");
    }
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        title="Delete selected projects"
        description="Are you sure you want delete the selected projects?"
        isLoading={isLoading}
        successAction={deleteProject}
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
        <Trash /> Delete projects
      </Button>
    </>
  );
}

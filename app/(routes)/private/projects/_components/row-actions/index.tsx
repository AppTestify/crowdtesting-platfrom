"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { IProjectPayload } from "@/app/_interface/project";
import { deleteProjectService } from "@/app/_services/project.service";
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
import { Edit, MoreHorizontal, TextSearch, Trash } from "lucide-react";
import { useState } from "react";
import EditProject from "../edit-project";
import Link from "next/link";

export function RowActions({
  row,
  refreshProjects,
}: {
  row: Row<IProjectPayload>;
  refreshProjects: () => void;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const deviceId = row.original.id as string;

  const deleteDevice = async () => {
    try {
      setIsLoading(true);
      const response = await deleteProjectService(deviceId);

      if (response?.message) {
        setIsLoading(false);
        refreshProjects();
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
      <EditProject
        project={row.original}
        sheetOpen={isEditOpen}
        setSheetOpen={setIsEditOpen}
        refreshProjects={refreshProjects}
      />

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        title="Delete project"
        description="Are you sure you want delete this project?"
        isLoading={isLoading}
        successAction={deleteDevice}
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
            onClick={() => {
              setIsEditOpen(true);
            }}
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

"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { IProjectUserDisplay } from "@/app/_interface/project";
import { deleteProjectUserService } from "@/app/_services/project.service";
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
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import EditProjectUser from "../edit-user";

export function ProjectUserRowActions({
    row,
    projectId,
    refreshProjectUsers,
}: {
    row: Row<IProjectUserDisplay>;
    projectId: string,
    refreshProjectUsers: () => void;
}) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const uderId = row.original?.userId?._id as string;

    const deleteIssue = async () => {
        try {
            setIsLoading(true);
            const response = await deleteProjectUserService(projectId, uderId);

            if (response?.message) {
                refreshProjectUsers();
                setIsDeleteOpen(false);
                setIsLoading(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsDeleteOpen(false);
            console.log("Error > deleteIssue");
        }
    };

    return (
        <>
            <EditProjectUser
                projectUser={row.original as IProjectUserDisplay}
                sheetOpen={isEditOpen}
                setSheetOpen={setIsEditOpen}
                refreshProjectUsers={refreshProjectUsers}
            />

            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Remove user"
                description="Are you sure you want remove this user?"
                isLoading={isLoading}
                successAction={deleteIssue}
                successLabel="Remove"
                successLoadingLabel="Removing"
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
                        <span className="text-destructive">Remove</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

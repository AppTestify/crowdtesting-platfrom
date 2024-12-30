"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
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
import { Edit, Eye, MoreHorizontal, Send, Trash } from "lucide-react";
import { useState } from "react";
import { IUserByAdmin } from "@/app/_interface/user";
import { deleteUserService, sendUserCredentialsService } from "@/app/_services/user.service";
import EditUser from "../edit-user";
import ViewTesterIssue from "../view-user";
import { UserRoles } from "@/app/_constants/user-roles";
import ViewClientUser from "../client/view-user";

export function UserRowActions({
    row,
    refreshUsers,
}: {
    row: Row<IUserByAdmin>;
    refreshUsers: () => void;
}) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isClientViewOpen, setIsClientViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const userId = row.original.id as string;

    const deleteDevice = async () => {
        try {
            setIsLoading(true);
            const response = await deleteUserService(userId);

            if (response?.message) {
                setIsLoading(false);
                refreshUsers();
                setIsDeleteOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsDeleteOpen(false);
            console.log("Error > deleteDevice");
        }
    };

    const sendUserCredentials = async () => {
        try {
            const response = await sendUserCredentialsService(userId);

            if (response?.message) {
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        }
    }

    const displayView = (row: any) => {
        if (row.original.role == UserRoles.TESTER) {
            setIsViewOpen(true);
        } else if (row.original.role == UserRoles.CLIENT) {
            setIsClientViewOpen(true);
        } else {
            null;
        }
    }

    return (
        <>
            <EditUser
                user={row.original}
                sheetOpen={isEditOpen}
                setSheetOpen={setIsEditOpen}
                refreshUsers={refreshUsers}
            />

            {/* view user */}
            <ViewTesterIssue
                user={row.original as IUserByAdmin}
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
            />

            {/* view client */}
            <ViewClientUser
                user={row.original as IUserByAdmin}
                sheetOpen={isClientViewOpen}
                setSheetOpen={setIsClientViewOpen}
            />

            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete user"
                description="Are you sure you want delete this user?"
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
                        onClick={() => displayView(row)}
                    >
                        <Eye className="h-2 w-2" /> View
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="border-b" />
                    <DropdownMenuItem
                        className="mb-1"
                        onClick={() => {
                            sendUserCredentials();
                        }}
                    >
                        <Send className="h-2 w-2 " /> Send
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="border-b" />
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
            </DropdownMenu >
        </>
    );
}

"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import toasterService from "@/app/_services/toaster-service";
import { usersBulkDeleteService } from "@/app/_services/user.service";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useState } from "react";

export function UserBulkDelete({
    ids,
    refreshUsers,
}: {
    ids: string[];
    refreshUsers: () => void;
}) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const deleteDevice = async () => {
        try {
            setIsLoading(true);
            const response = await usersBulkDeleteService({ ids });

            if (response?.message) {
                setIsLoading(false);
                refreshUsers();
                setIsDeleteOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsDeleteOpen(false);
            console.log("Error > deleteUsers");
        }
    };

    return (
        <>
            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete selected user"
                description="Are you sure you want delete the selected user?"
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
                <Trash /> Delete user
            </Button>
        </>
    );
}

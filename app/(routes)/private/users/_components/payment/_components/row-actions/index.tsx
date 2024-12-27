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
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import { IPayment } from "@/app/_interface/payment";
import { deletePaymentService } from "@/app/_services/payment.service";
import EditPayment from "../edit-payment";

export function PaymentRowActions({
    row,
    refreshPayment,
}: {
    row: Row<IPayment>;
    refreshPayment: () => void;
}) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const paymentId = row.original._id as string;

    const deletePayment = async () => {
        try {
            setIsLoading(true);
            const response = await deletePaymentService(paymentId);

            if (response?.message) {
                setIsLoading(false);
                refreshPayment();
                setIsDeleteOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsDeleteOpen(false);
            console.log("Error > deletePayment");
        }
    };

    const closeDialog = () => setIsEditOpen(false);

    return (
        <>
            <EditPayment
                payment={row.original}
                isDialogOpen={isEditOpen}
                dialogClose={closeDialog}
                refreshPayment={refreshPayment}
            />

            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete payment"
                description="Are you sure you want delete this payment?"
                isLoading={isLoading}
                successAction={deletePayment}
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
            </DropdownMenu >
        </>
    );
}

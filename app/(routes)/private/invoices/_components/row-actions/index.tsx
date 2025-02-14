"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import toasterService from "@/app/_services/toaster-service";
import { Button } from "@/components/ui/button";
import { Row } from "@tanstack/react-table";
import { Download, Loader2, Trash } from "lucide-react";
import { useState } from "react";
import { downloadFileFromDrive } from "@/app/_utils/common";
import { deleteInvoiceService } from "@/app/_services/invoice.service";
import { IInvoice } from "@/app/_interface/invoice";

export function InvoiceRowActions({
    row,
    refreshDocuments,
    userId
}: {
    row: Row<IInvoice>;
    refreshDocuments: () => void;
    userId?: string;
}) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloadLoading, setIsDownloadLoading] = useState(false);
    const fileId = row.original.cloudId as string;

    const deleteInvoice = async () => {
        try {
            setIsLoading(true);
            const response = await deleteInvoiceService(fileId);

            if (response?.message) {
                setIsLoading(false);
                refreshDocuments();
                setIsDeleteOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsDeleteOpen(false);
        }
    };

    const getFile = async () => {
        setIsDownloadLoading(true);
        try {
            const fileName = row.original.name;
            await downloadFileFromDrive(fileId, fileName)
        } catch (error) {
            toasterService.error();
            console.log("Error > getFile", error);
        } finally {
            setIsDownloadLoading(false);
        }
    };

    return (
        <>
            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete invoice"
                description="Are you sure you want delete this invoice?"
                isLoading={isLoading}
                successAction={deleteInvoice}
                successLabel="Delete"
                successLoadingLabel="Deleting"
                successVariant={"destructive"}
            />

            <div className="flex justify-end pr-4">
                <Button variant="ghost" size="icon" onClick={() => getFile()}>
                    {isDownloadLoading ?
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                        <Download className="h-4 w-4" />
                    }
                </Button>

                <Button
                    onClick={() => {
                        setIsDeleteOpen(true);
                        setIsLoading(false);
                    }}
                    variant="ghost"
                    size="icon"
                >
                    <Trash className="h-4 w-4 text-destructive" />
                </Button>

            </div>
        </>
    );
}

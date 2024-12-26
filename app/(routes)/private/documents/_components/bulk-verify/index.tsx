"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { verifyFilesService } from "@/app/_services/file.service";
import toasterService from "@/app/_services/toaster-service";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Trash } from "lucide-react";
import { useState } from "react";

export function DocumentBulkVeified({
    ids,
    refreshDocuments,
}: {
    ids: string[];
    refreshDocuments: () => void;
}) {
    const [isVerifiedOpen, setIsVerifiedOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const verifyDocuments = async () => {
        try {
            setIsLoading(true);
            const response = await verifyFilesService(ids);

            if (response?.message) {
                setIsLoading(false);
                refreshDocuments();
                setIsVerifiedOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsVerifiedOpen(false);
            console.log("Error > verifyDocuments");
        }
    };

    return (
        <>
            <ConfirmationDialog
                isOpen={isVerifiedOpen}
                setIsOpen={setIsVerifiedOpen}
                title="verified selected user"
                description="Are you sure you want verified the selected user?"
                isLoading={isLoading}
                successAction={verifyDocuments}
                successLabel="Verified"
                successLoadingLabel="Verifing"
                successVariant={"default"}
            />

            <Button
                variant={"outline"}
                onClick={() => {
                    setIsVerifiedOpen(true);
                    setIsLoading(false);
                }}
            >
                <ShieldCheck /> Verified documents
            </Button>
        </>
    );
}

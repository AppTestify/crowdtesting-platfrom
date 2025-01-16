"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { nonVerifyFilesService, verifyFilesService } from "@/app/_services/file.service";
import toasterService from "@/app/_services/toaster-service";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Trash } from "lucide-react";
import { useState } from "react";

export function DocumentBulkNonVerified({
    ids,
    refreshDocuments,
}: {
    ids: string[];
    refreshDocuments: () => void;
}) {
    const [isVerifiedOpen, setIsVerifiedOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const nonVerifyDocuments = async () => {
        try {
            setIsLoading(true);
            const response = await nonVerifyFilesService(ids);

            if (response?.message) {
                setIsLoading(false);
                refreshDocuments();
                setIsVerifiedOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsVerifiedOpen(false);
            console.log("Error > nonVerifyDocuments");
        }
    };

    return (
        <>
            <ConfirmationDialog
                isOpen={isVerifiedOpen}
                setIsOpen={setIsVerifiedOpen}
                title="Non verify selected user"
                description="Are you sure you want non verify the selected user?"
                isLoading={isLoading}
                successAction={nonVerifyDocuments}
                successLabel="Non Verify"
                successLoadingLabel="Non Verifing"
                successVariant={"default"}
            />

            <Button
                variant={"outline"}
                onClick={() => {
                    setIsVerifiedOpen(true);
                    setIsLoading(false);
                }}
            >
                <ShieldCheck /> Non verify documents
            </Button>
        </>
    );
}

import { ConfirmationDialog } from '@/app/_components/confirmation-dialog';
import { IDocument } from '@/app/_interface/document';
import { verifyFileService } from '@/app/_services/file.service';
import toasterService from '@/app/_services/toaster-service';
import { downloadDocument } from '@/app/_utils/common';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Row } from '@tanstack/react-table';
import { Download, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react'

export default function VerifiedRowActions({ row, refreshDocuments }:
    {
        row: Row<IDocument>;
        refreshDocuments: () => void;
    }
) {
    const [isVerifyOpen, setIsVerifyOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const verifyDocument = async () => {
        setIsLoading(true);
        try {
            const response = await verifyFileService(row.original.id);
            if (response) {
                toasterService.success(response?.message);
                refreshDocuments();
                setIsVerifyOpen(false);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    const getFile = async () => {
        try {
            downloadDocument(
                row.original.contentType,
                row.original.data,
                row.original.name
            );
        } catch (error) {
            toasterService.error();
            console.log("Error > getFile", error);
        }
    };

    return (
        <>
            <ConfirmationDialog
                isOpen={isVerifyOpen}
                setIsOpen={setIsVerifyOpen}
                title="Verify document"
                description="Are you sure you want verify this document?"
                isLoading={isLoading}
                successAction={verifyDocument}
                successLabel="Verify"
                successLoadingLabel="Verifing"
                successVariant={"default"}
            />

            <div className="flex justify-end pr-8">
                <Button variant="ghost" size="icon" onClick={() => getFile()}>
                    <Download className="h-5 w-5" />
                </Button>
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost"
                                onClick={() => setIsVerifyOpen(true)}
                            >
                                <ShieldCheck className="text-primary h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Verify</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </>
    )
}

import { ConfirmationDialog } from '@/app/_components/confirmation-dialog';
import { IDocument } from '@/app/_interface/document';
import { nonVerifyFileService } from '@/app/_services/file.service';
import toasterService from '@/app/_services/toaster-service';
import { downloadDocument } from '@/app/_utils/common';
import { Button } from '@/components/ui/button';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tooltip } from '@radix-ui/react-tooltip';
import { Row } from '@tanstack/react-table';
import { Download, ShieldOff } from 'lucide-react';
import React, { useState } from 'react'

export default function NonVerifiedRowActions({ row, refreshDocuments }:
    {
        row: Row<IDocument>;
        refreshDocuments: () => void;
    }
) {
    const [isNonVerifyOpen, setIsNonVerifyOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const verifyDocument = async () => {
        setIsLoading(true);
        try {
            const response = await nonVerifyFileService(row.original.id);
            if (response) {
                toasterService.success(response?.message);
                refreshDocuments();
                setIsNonVerifyOpen(false);
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
                isOpen={isNonVerifyOpen}
                setIsOpen={setIsNonVerifyOpen}
                title="Non verify document"
                description="Are you sure you want non verify this document?"
                isLoading={isLoading}
                successAction={verifyDocument}
                successLabel="Non verify"
                successLoadingLabel="Non verifing"
                successVariant={"default"}
            />
            <div className="flex justify-end pr-4">
                <Button variant="ghost" size="icon" onClick={() => getFile()}>
                    <Download className="h-5 w-5" />
                </Button>
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost"
                                onClick={() => setIsNonVerifyOpen(true)}
                            >
                                <ShieldOff className="text-primary h-5 w-5" />
                                {/* <ShieldCheck className="text-primary h-5 w-5" /> */}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Non verify</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </>
    )
}

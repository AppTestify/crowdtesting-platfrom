import { IDocument } from '@/app/_interface/document';
import toasterService from '@/app/_services/toaster-service';
import { downloadDocument } from '@/app/_utils/common';
import { Button } from '@/components/ui/button';
import { Row } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import React from 'react'

export default function NonVerifiedRowActions({ row, refreshDocuments }:
    {
        row: Row<IDocument>;
        refreshDocuments: () => void;
    }
) {
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
            <div className="flex justify-end pr-4">
                <Button variant="ghost" size="icon" onClick={() => getFile()}>
                    <Download className="h-5 w-5" />
                </Button>
            </div>
        </>
    )
}

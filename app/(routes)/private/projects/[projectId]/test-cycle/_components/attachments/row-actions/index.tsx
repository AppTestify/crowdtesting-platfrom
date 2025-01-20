"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import toasterService from "@/app/_services/toaster-service";
import { Button } from "@/components/ui/button";
import { Row } from "@tanstack/react-table";
import { Download, Trash } from "lucide-react";
import { useState } from "react";
import { downloadDocument } from "@/app/_utils/common";
import { IIssueAttachmentDisplay } from "@/app/_interface/issue";
import { useParams } from "next/navigation";
import { deleteTestCycleAttachmentService } from "@/app/_services/test-cycle-attachment.service";

export function TestCycleAttachmentRowActions({
    row,
    refreshAttachments,
    testCycleId,
    isView,
}: {
    row: Row<IIssueAttachmentDisplay>;
    refreshAttachments: () => void;
    testCycleId: string;
    isView: boolean;
}) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { projectId } = useParams<{ projectId: string }>();
    const fileId = row.original.attachment.cloudId as string;

    const deleteAttachment = async () => {
        try {
            setIsLoading(true);
            const response = await deleteTestCycleAttachmentService(projectId, testCycleId, fileId);

            if (response?.message) {
                setIsLoading(false);
                refreshAttachments();
                setIsDeleteOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsDeleteOpen(false);
            console.log("Error > deleteAttachment");
        }
    };

    const getFile = async () => {
        try {
            const fileName = row.original.attachment?.name;
            const contentType = row.original.attachment?.contentType;
            const base64 = row.original?.base64;
            downloadDocument(contentType, base64, fileName)
        } catch (error) {
            toasterService.error();
            console.log("Error > getFile", error);
        }
    };

    return (
        <>
            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete attachment"
                description="Are you sure you want delete this attachment?"
                isLoading={isLoading}
                successAction={deleteAttachment}
                successLabel="Delete"
                successLoadingLabel="Deleting"
                successVariant={"destructive"}
            />
            <div className="flex justify-end pr-4">
                <Button type="button" variant="ghost" size="icon" onClick={() => getFile()}>
                    <Download className="h-4 w-4" />
                </Button>
                {!isView ?
                    <Button
                        type="button"
                        onClick={() => {
                            setIsDeleteOpen(true);
                            setIsLoading(false);
                        }}
                        variant="ghost"
                        size="icon"
                    >
                        <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                    : ''}
            </div>
        </>
    );
}

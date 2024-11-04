"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import toasterService from "@/app/_services/toaster-service";
import { Button } from "@/components/ui/button";
import { Row } from "@tanstack/react-table";
import { Download, Trash } from "lucide-react";
import { useState } from "react";
import { downloadDocument } from "@/app/_utils/common";
import { IIssueAttachmentDisplay } from "@/app/_interface/issue";
import { deleteIssueAttachmentService } from "@/app/_services/issue-attachment.service";
import { useParams } from "next/navigation";

export function AttachmentRowActions({
    row,
    refreshAttachments,
    issueId,
}: {
    row: Row<IIssueAttachmentDisplay>;
    refreshAttachments: () => void;
    issueId: string;
}) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const attachmentId = row.original.id as string;
    const { projectId } = useParams<{ projectId: string }>();

    const deleteAttachment = async () => {
        try {
            setIsLoading(true);
            const response = await deleteIssueAttachmentService(projectId, issueId, attachmentId);

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
            downloadDocument(
                row.getValue("contentType"),
                row.getValue("data"),
                row.getValue("name")
            );
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
                <Button variant="ghost" size="icon" onClick={() => getFile()}>
                    <Download className="h-4 w-4" />
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

"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { IReport } from "@/app/_interface/report";
import { ITestCycle } from "@/app/_interface/test-cycle";
import { deleteReportService } from "@/app/_services/report.service";
import { deleteTestCycleService } from "@/app/_services/test-cycle.service";
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
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import { EditReport } from "../edit-report";
import ViewReport from "../view-report";

export function ReportRowActions({
    row,
    refreshReports,
}: {
    row: Row<IReport>;
    refreshReports: () => void;
}) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const projectId = row.original.projectId as string;
    const reportId = row.original._id as string;

    const deleteReport = async () => {
        try {
            setIsLoading(true);
            const response = await deleteReportService(projectId, reportId);

            if (response?.message) {
                setIsLoading(false);
                refreshReports();
                setIsDeleteOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsDeleteOpen(false);
            console.log("Error > deleteReport");
        }
    };

    return (
        <>
            <EditReport
                report={row.original as IReport}
                sheetOpen={isEditOpen}
                setSheetOpen={setIsEditOpen}
                refreshReports={refreshReports}
            />

            <ViewReport
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
                report={row.original as IReport}
            />

            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete report"
                description="Are you sure you want delete this report?"
                isLoading={isLoading}
                successAction={deleteReport}
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
                            setIsViewOpen(true);
                        }}
                    >
                        <Eye className="h-2 w-2" /> View
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="border-b" />
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
            </DropdownMenu>
        </>
    );
}

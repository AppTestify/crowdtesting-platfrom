"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { ITestCycle } from "@/app/_interface/test-cycle";
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
import { ChartNoAxesGantt, Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import { EditTestCycle } from "../edit-test-cycle";
import AssignTestCase from "../assign-test-cases";
import TestCycleView from "../view-test-cycle";

export function TestCycleRowActions({
    row,
    refreshTestCycle,
}: {
    row: Row<ITestCycle>;
    refreshTestCycle: () => void;
}) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isActionOpen, setIsActionOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const projectId = row.original.projectId as string;
    const testCycleId = row.original.id as string;
    const deleteTestCycle = async () => {
        try {
            setIsLoading(true);
            const response = await deleteTestCycleService(projectId, testCycleId);

            if (response?.message) {
                setIsLoading(false);
                refreshTestCycle();
                setIsDeleteOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsDeleteOpen(false);
            console.log("Error > deleteTestCycle");
        }
    };

    return (
        <>
            <TestCycleView
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
                testCycle={row.original as ITestCycle}
            />
            <EditTestCycle
                testCycle={row.original as ITestCycle}
                sheetOpen={isEditOpen}
                setSheetOpen={setIsEditOpen}
                refreshTestCycle={refreshTestCycle}
            />

            <AssignTestCase
                sheetOpen={isActionOpen}
                setSheetOpen={setIsActionOpen}
                row={row}
            />

            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete test cycle"
                description="Are you sure you want delete this test cycle?"
                isLoading={isLoading}
                successAction={deleteTestCycle}
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
                            setIsActionOpen(true);
                        }}
                    >
                        <ChartNoAxesGantt className="h-2 w-2" /> Test cases
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="border-b" />
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

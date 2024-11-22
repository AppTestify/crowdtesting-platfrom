"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { ITestPlan } from "@/app/_interface/test-plan";
import { deleteTestPlanService } from "@/app/_services/test-plan.service";
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
import { EditTestPlan } from "../edit-test-plan";
import ViewTestPlan from "../view-test-plan";

export function TestPlansRowActions({
    row,
    refreshTestPlans,
}: {
    row: Row<ITestPlan>;
    refreshTestPlans: () => void;
}) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const projectId = row.original.projectId as string;
    const testPlanId = row.original.id as string;

    const deleteTestPlan = async () => {
        try {
            setIsLoading(true);
            const response = await deleteTestPlanService(projectId, testPlanId);

            if (response?.message) {
                setIsLoading(false);
                refreshTestPlans();
                setIsDeleteOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsDeleteOpen(false);
            console.log("Error > deleteTestPlan");
        }
    };

    return (
        <>
            <EditTestPlan
                testPlan={row.original as ITestPlan}
                sheetOpen={isEditOpen}
                setSheetOpen={setIsEditOpen}
                refreshTestPlans={refreshTestPlans}
            />

            <ViewTestPlan
                testPlan={row.original as ITestPlan}
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
            />

            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete test plan"
                description="Are you sure you want delete this test plan?"
                isLoading={isLoading}
                successAction={deleteTestPlan}
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

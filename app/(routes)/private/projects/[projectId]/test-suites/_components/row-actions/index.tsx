"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
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
import { Edit, Eye, Loader2, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
// import { EditDevice } from "../edit-device";
import { ITestSuite } from "@/app/_interface/test-suite";
import { deleteTestSuiteService } from "@/app/_services/test-suite.service";
import { EditTestSuite } from "../edit-test-suite";
import ViewTestSuite from "../view-test-suite";

export function TestSuiteRowActions({
    row,
    // browsers,
    refreshTestSuites,
}: {
    row: Row<ITestSuite>;
    // browsers: ITestSuite[];
    refreshTestSuites: () => void;
}) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const testSuiteId = row.original.id as string;
    const projectId = row.original.projectId as string;
    const deleteTestSuite = async () => {
        try {
            setIsLoading(true);
            const response = await deleteTestSuiteService(projectId, testSuiteId);

            if (response?.message) {
                setIsLoading(false);
                refreshTestSuites();
                setIsDeleteOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsDeleteOpen(false);
            console.log("Error > deleteTestSuite");
        }
    };
    // updateTestSuiteService
    return (
        <>
            <EditTestSuite
                testSuite={row.original as ITestSuite}
                sheetOpen={isEditOpen}
                setSheetOpen={setIsEditOpen}
                refreshTestSuites={refreshTestSuites}
            />

            <ViewTestSuite
                testSuite={row.original as ITestSuite}
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
            />

            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete test suite"
                description="Are you sure you want delete this test suite?"
                isLoading={isLoading}
                successAction={deleteTestSuite}
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

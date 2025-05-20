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
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import { deleteTestCaseService } from "@/app/_services/test-case.service";
import { ITestCase } from "@/app/_interface/test-case";
import { EditTestCase } from "../edit-test-case";
import { ITestSuite } from "@/app/_interface/test-suite";
import ViewTestCase from "../view-test-case";
import { TestCase } from "@/app/_constants/test-case";

export function TestCaseRowActions({
    row,
    onEditClick,
    onViewClick,
    testSuites,
    refreshTestCases,
}: {
    row: Row<ITestCase>;
    onEditClick: (testCase: ITestCase) => void;
    onViewClick: (testCase: ITestCase) => void;
    testSuites: ITestSuite[];
    refreshTestCases: () => void;
}) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const testSuiteId = row.original.id as string;
    const projectId = row.original.projectId as string;
    const deleteCaseSuite = async () => {
        try {
            setIsLoading(true);
            const response = await deleteTestCaseService(projectId, testSuiteId);

            if (response?.message) {
                setIsLoading(false);
                refreshTestCases();
                setIsDeleteOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsDeleteOpen(false);
            console.log("Error > deleteCaseSuite");
        }
    };
    return (
        <>
            

            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete test case"
                description="Are you sure you want delete this test case?"
                isLoading={isLoading}
                successAction={deleteCaseSuite}
                successLabel="Delete"
                successLoadingLabel="Deleting"
                successVariant={"destructive"}
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild >
                    <Button variant="ghost" className="h-8 w-8 p-0" >
                        <span className="sr-only" > Open menu </span>
                        < MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                < DropdownMenuContent align="end" >
                    <DropdownMenuItem
                        className="mb-1"
                        onClick={() => {
                            onViewClick(row.original);
                        }}
                    >
                        <Eye className="h-2 w-2" /> View
                    </DropdownMenuItem>
                    < DropdownMenuSeparator className="border-b" />
                    <DropdownMenuItem
                        className="mb-1"
                        onClick={() => {
                            onEditClick(row.original);
                        }}
                    >
                        <Edit className="h-2 w-2" /> Edit
                    </DropdownMenuItem>
                    < DropdownMenuSeparator className="border-b" />
                    <DropdownMenuItem
                        className="my-1"
                        onClick={() => {
                            setIsDeleteOpen(true);
                            setIsLoading(false);
                        }}
                    >
                        <Trash className="h-2 w-2 text-destructive" /> {" "}
                        < span className="text-destructive" > Delete </span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

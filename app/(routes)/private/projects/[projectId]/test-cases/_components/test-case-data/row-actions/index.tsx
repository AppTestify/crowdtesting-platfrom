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
import { ITestCaseData } from "@/app/_interface/test-case-data";
import { deleteTestCaseDataService } from "@/app/_services/test-case-data.service";
import { useParams } from "next/navigation";

export function TestCaseDataRowActions({
    row,
    refreshTestCaseData,
}: {
    row: Row<ITestCaseData>;
    refreshTestCaseData: () => void;
}) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const testCaseDataId = row.original._id as string;
    const testCaseId = row.original.testCaseId as string;
    const { projectId } = useParams<{ projectId: string }>();

    const deleteTestCaseData = async () => {
        try {
            setIsLoading(true);
            const response = await deleteTestCaseDataService(projectId, testCaseId, testCaseDataId);

            if (response?.message) {
                setIsLoading(false);
                refreshTestCaseData();
                setIsDeleteOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsDeleteOpen(false);
            console.log("Error > deleteTestCaseData",error);
        }
    };
    return (
        <>
            {/* <EditTestCase
                testCases={row.original as ITestCase}
                sheetOpen={isEditOpen}
                setSheetOpen={setIsEditOpen}
                testSuites={testSuites}
                refreshTestCaseData={refreshTestCaseData}
            /> */}


            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete test case data"
                description="Are you sure you want delete this test case data?"
                isLoading={isLoading}
                successAction={deleteTestCaseData}
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
                            setIsEditOpen(true);
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

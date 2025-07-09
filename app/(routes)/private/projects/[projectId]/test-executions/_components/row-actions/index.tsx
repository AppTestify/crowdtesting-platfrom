"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { ITestExecution } from "@/app/_interface/test-execution";
import { deleteTestExecutionsService } from "@/app/_services/test-execution.service";
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
import { Eye, MoreHorizontal, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import TestExecutionView from "../view-test-execution";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";

export function TestExecutionRowActions({
    row,
    refreshTestExecution,
    onViewClick,
}: {
    row: Row<ITestExecution>;
    refreshTestExecution: () => void;
    onViewClick:(viewExecution:ITestExecution)=>void;
}) {
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState<any>();
    const { data } = useSession();
    const projectId = row.original.projectId as string;
    const testCycleId = row.original.id as string;

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    const deleteTestCycle = async () => {
        try {
            setIsLoading(true);
            const response = await deleteTestExecutionsService(projectId, testCycleId);

            if (response?.message) {
                refreshTestExecution();
                setIsDeleteOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsDeleteOpen(false);
            console.log("Error > deleteTestCycle");
        } finally {
            setIsLoading(false);
        }
    };

    // For crowd testers, only show view option
    if (userData?.role === UserRoles.CROWD_TESTER) {
        return (
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
                            onViewClick(row.original);
                            setIsViewOpen(true);
                        }}
                    >
                        <Eye className="h-2 w-2" /> View
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <>
            <TestExecutionView
                sheetOpen={isViewOpen}
                setSheetOpen={setIsViewOpen}
                testExecution={row.original as ITestExecution}
            />

            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete test execution"
                description="Are you sure you want delete this test execution?"
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
                            onViewClick(row.original);
                            setIsViewOpen(true);
                        }}
                    >
                        <Eye className="h-2 w-2" /> View
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

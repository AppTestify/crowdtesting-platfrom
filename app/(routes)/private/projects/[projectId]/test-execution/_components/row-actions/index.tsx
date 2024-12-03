"use client";
import { ITestCycle } from "@/app/_interface/test-cycle";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Row } from "@tanstack/react-table";
import { ChartNoAxesGantt, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export function TestExecutionRowActions({
    row,
    refreshTestCycle,
}: {
    row: Row<ITestCycle>;
    refreshTestCycle: () => void;
}) {
    const projectId = row.original.projectId as string;
    const testCycleId = row.original.id as string;

    return (
        <>
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
                    >
                        <Link href={`/private/projects/${projectId}/test-execution/${testCycleId}`}>
                            <div className="flex">
                                <ChartNoAxesGantt className="h-5 w-5 mr-2" />
                                Test cases
                            </div>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

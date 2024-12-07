"use client";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { INote } from "@/app/_interface/note";
import { ITestCycle } from "@/app/_interface/test-cycle";
import { deleteNoteService } from "@/app/_services/note.service";
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
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import { EditNote } from "../edit-note";

export function NoteRowActions({
    row,
    refreshNotes,
}: {
    row: Row<INote>;
    refreshNotes: () => void;
}) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const projectId = row.original.projectId as string;
    const noteId = row.original._id as string;
    const deleteNote = async () => {
        try {
            setIsLoading(true);
            const response = await deleteNoteService(projectId, noteId);

            if (response?.message) {
                setIsLoading(false);
                refreshNotes();
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
            <EditNote
                Note={row.original as INote}
                sheetOpen={isEditOpen}
                setSheetOpen={setIsEditOpen}
                refreshNotes={refreshNotes}
            />

            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete note"
                description="Are you sure you want delete this note?"
                isLoading={isLoading}
                successAction={deleteNote}
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

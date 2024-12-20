import { formatDate } from '@/app/_constants/date-formatter';
import { INote } from '@/app/_interface/note';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import React from 'react'

export default function ViewNote({ sheetOpen, setSheetOpen, note }:
    {
        sheetOpen: boolean;
        setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
        note: INote;
    }
) {
    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader className="mb-4">
                    <span className="text-mute text-sm">
                        {note?.userId?.firstName ? (
                            <span>
                                Created by {note?.userId?.firstName}{" "}
                                {note?.userId?.lastName}{", "}
                            </span>
                        ) : null}
                        Created on {formatDate(note?.createdAt || "")}
                    </span>
                </SheetHeader>
                <DropdownMenuSeparator className="border-b" />
                <div className="mt-2">
                    <span className="font-semibold text-xl">Title</span>
                    <div className="ml-1">
                        {note?.title}
                    </div>
                </div>
                <div className="mt-2">
                    <span className="font-semibold text-xl">Description</span>
                    <div
                        className="text-sm leading-relaxed text-gray-700 space-y-2 rich-description"
                        dangerouslySetInnerHTML={{
                            __html: note?.description || "",
                        }}
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
}

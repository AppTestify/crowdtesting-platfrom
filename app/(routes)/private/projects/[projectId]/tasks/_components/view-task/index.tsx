import { formatDate } from '@/app/_constants/date-formatter';
import { NAME_NOT_SPECIFIED_ERROR_MESSAGE } from '@/app/_constants/errors';
import { ITask } from '@/app/_interface/task';
import { displayIcon, statusBadge } from '@/app/_utils/common-functionality';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { UserCircle2Icon } from 'lucide-react';
import React from 'react'

export default function ViewTask({ sheetOpen, setSheetOpen, task }:
    {
        task: ITask;
        sheetOpen: boolean;
        setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    }
) {
    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader className="mb-4">
                    <span className="text-mute text-sm">
                        {task?.userId?.firstName ? (
                            <span>
                                Created by {task?.userId?.firstName}{" "}
                                {task?.userId?.lastName}{", "}
                            </span>
                        ) : null}
                        Created on {formatDate(task?.createdAt || "")}
                    </span>
                </SheetHeader>
                <DropdownMenuSeparator className="border-b" />
                <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-4 text-sm ">

                        {/* Title */}
                        <div className="flex items-center">
                            <span className="">Title:</span>
                            <span className="ml-2 flex items-center">
                                <span className="ml-1">{task?.title}</span>
                            </span>
                        </div>

                        {/* Priority */}
                        <div className="flex items-center">
                            <span className="">Priority:</span>
                            <span className="ml-2 flex items-center">
                                {displayIcon(task?.priority)}
                                <span className="ml-1">{task?.priority}</span>
                            </span>
                        </div>

                        {/* Title */}
                        <div className="flex items-center">
                            <span className="">Issue:</span>
                            <span className="ml-2 flex items-center">
                                <span className="ml-1">{task?.issueId?.title}</span>
                            </span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center">
                            <span className="">Status:</span>
                            <span className="ml-2">{statusBadge(task?.status)}</span>
                        </div>

                        <div className="flex items-center gap-[10px]">
                            <span className="">Reporter:</span>
                            <span className="text-sm flex items-center">
                                <UserCircle2Icon className="text-gray-600 h-4 w-4 mr-1" />
                                {`${task?.userId?.firstName || ""} ${task?.userId?.lastName || ""}`}
                            </span>
                        </div>

                        <div className="flex items-center gap-[10px]">
                            <span className="">Assignee:</span>
                            <span className="text-sm flex items-center">
                                <UserCircle2Icon className="text-gray-600 h-4 w-4 mr-1" />
                                {task?.assignedTo?._id ? (
                                    `${task?.assignedTo?.firstName ||
                                    NAME_NOT_SPECIFIED_ERROR_MESSAGE
                                    } ${task?.assignedTo?.lastName || ""}`
                                ) : (
                                    <span className="text-gray-400">Unassigned</span>
                                )}
                            </span>
                        </div>
                        <div className="flex gap-[10px]">
                            <span className="">Description:</span>
                            <div
                                className=""
                                dangerouslySetInnerHTML={{
                                    __html: task?.description || "",
                                }}
                            />
                        </div>
                    </div>
                </div>

            </SheetContent>
        </Sheet >
    )
}

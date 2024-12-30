import { UserRoles } from '@/app/_constants/user-roles';
import { IUserByAdmin } from '@/app/_interface/user';
import { showUsersRoleInBadges } from '@/app/_utils/common-functionality';
import { getAvatarFallbackText, getFormattedBase64ForSrc } from '@/app/_utils/string-formatters';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { Copy } from 'lucide-react';
import React, { useState } from 'react'

export default function ViewClientUser({
    user,
    sheetOpen,
    setSheetOpen,
}: {
    user: IUserByAdmin;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [open, setOpen] = useState(false);


    const copyEmail = (email: string) => {
        navigator.clipboard.writeText(email)
            .then(() => {
                setOpen(true);
                setTimeout(() => setOpen(false), 1500);
            })
            .catch((err) => {
                console.error("Failed to copy email: ", err);
            });
    };

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[50%] md:!max-w-[50%] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-left">Profile view</SheetTitle>
                    <DropdownMenuSeparator className="border-b" />
                </SheetHeader>
                {isViewLoading ? (
                    <>
                        <div className="flex items-center space-x-4 mt-4">
                            <Skeleton className="h-16 w-16 rounded-full bg-gray-200" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[400px] bg-gray-200" />
                                <Skeleton className="h-4 w-[350px] bg-gray-200" />
                            </div>
                        </div>
                        <div className="flex mt-5">
                            <Skeleton className="h-8 w-[390px] bg-gray-200" />
                        </div>
                    </>
                ) : (
                    <>
                        <SheetTitle>
                            <div className="flex items-center space-x-2 p-2">
                                <Avatar className="h-16 w-16 rounded-full overflow-hidden">
                                    <AvatarImage
                                        src={getFormattedBase64ForSrc(user?.profilePicture)}
                                        alt="Profile Picture"
                                        className="h-full w-full object-cover"
                                    />
                                    <AvatarFallback>
                                        {getAvatarFallbackText({
                                            ...user,
                                            name: `${user?.firstName || ""} ${user?.lastName || ""}`,
                                            email: user?.email || ""
                                        })}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col space-y-1">
                                    <div className="font-semibold text-gray-800 text-md truncate">
                                        {user?.firstName || "User"} {user?.lastName || "Name"}
                                    </div>
                                    <TooltipProvider>
                                        <div className="flex text-gray-500 text-sm truncate">
                                            <span className="truncate">{user?.email}</span>
                                            <Tooltip open={open}>
                                                <TooltipTrigger asChild>
                                                    <span
                                                        className="ml-2 flex-shrink-0 cursor-pointer"
                                                        onClick={() => copyEmail(user?.email as string)}
                                                    >
                                                        <Copy className="w-4" />
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    Copied!
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="text-end text-gray-500 text-sm">
                                        {showUsersRoleInBadges(user?.role as UserRoles)}
                                    </div>
                                    <div className="text-end text-xs text-gray-500">
                                        {
                                            user?.createdAt ?
                                                formatDistanceToNow(new Date(user?.createdAt), { addSuffix: true }) :
                                                "Date not available"
                                        }
                                    </div>
                                </div>
                            </div>
                        </SheetTitle>
                        <DropdownMenuSeparator className="border-b" />
                    </>
                )}
            </SheetContent>
        </Sheet >
    )
}

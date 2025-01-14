import { MOBILE_BREAKPOINT } from '@/app/_constants/media-queries';
import { IRequirement } from '@/app/_interface/requirement';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';

export default function ExpandableTable({ row }: { row: any[] }) {
    const isMobile = useMediaQuery({ query: MOBILE_BREAKPOINT });

    const mobileVisibleCount = 1;
    const desktopVisibleCount = 1;
    const [showAll, setShowAll] = useState(false);

    const visibleCount = isMobile ? mobileVisibleCount : desktopVisibleCount;

    const displayedRows = row.slice(0, visibleCount);
    const hiddenRows = row.slice(visibleCount);

    return (
        <div className="flex gap-2 items-center">

            {displayedRows.map((rowItem, index) => (
                <div key={index} className="truncate">
                    <Badge variant="outline" className="font-medium">
                        {rowItem?.name ? rowItem?.name : rowItem?.title}
                    </Badge>
                </div>
            ))}

            {hiddenRows.length > 0 && !showAll && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="text-sm text-gray-500">+{hiddenRows.length}</button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {hiddenRows.map((hiddenItem, index) => (
                            <DropdownMenuItem key={index} className="pointer-events-none">
                                <div className='text-xs'>
                                    {hiddenItem?.name ? hiddenItem?.name : hiddenItem?.title}
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
}

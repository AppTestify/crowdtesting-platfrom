import { MOBILE_BREAKPOINT } from '@/app/_constants/media-queries';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import React, { useState } from 'react'
import { useMediaQuery } from 'react-responsive';

export default function ExpandableTable({ row }:
    { row: any }
) {
    const isMobile = useMediaQuery({ query: MOBILE_BREAKPOINT });

    const mobileVisibleCount = 1;
    const desktopVisibleCount = 2;
    const [showAll, setShowAll] = useState(false);

    const displayedRows = showAll
        ? row
        : row.slice(0, isMobile ? mobileVisibleCount : desktopVisibleCount);

    const hiddenCount = row.length - (isMobile ? mobileVisibleCount : desktopVisibleCount);


    return (
        <div className="flex gap-2 items-center">
            {displayedRows.map((rowItem: any) => (
                <div className=' truncate'>
                    <Badge className='font-medium'>
                        {rowItem?.title}
                    </Badge>
                </div>
            ))}
            {hiddenCount > 0 && !showAll && (
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <span className="text-sm text-gray-500">+{hiddenCount}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {displayedRows.map((requirement: any) => (
                            <DropdownMenuItem key={displayedRows.id} className="pointer-events-none">
                                <div>
                                    {requirement?.title}
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    )
}

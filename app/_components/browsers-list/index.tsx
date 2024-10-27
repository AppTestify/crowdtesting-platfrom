import * as React from "react";
import { IBrowser } from "@/app/_interface/browser";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMediaQuery } from 'react-responsive';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MOBILE_BREAKPOINT } from "@/app/_constants/media-queries";

export function BrowsersList({
  browsers,
  selectedBrowsers,
}: {
  browsers: IBrowser[];
  selectedBrowsers: string[];
}) {
  const isMobile = useMediaQuery({ query: MOBILE_BREAKPOINT });

  const mobileVisibleCount = 1;
  const desktopVisibleCount = 3;

  const filteredBrowsers = browsers.filter((browser) => selectedBrowsers.includes(browser.id));
  const visibleBrowsers = filteredBrowsers.slice(0, isMobile ? mobileVisibleCount : desktopVisibleCount);
  const remainingBrowsers = filteredBrowsers.slice(isMobile ? mobileVisibleCount : desktopVisibleCount);

  return (
    <div className="flex gap-2 items-center">
      {visibleBrowsers.map((browser) => (
        <TooltipProvider key={browser.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <img src={`data:image/png;base64,${browser.logo}`} alt={browser.name} height={18} width={18} />
            </TooltipTrigger>
            <TooltipContent>
              <p>{browser.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {remainingBrowsers.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <span className="text-sm text-gray-500">+{remainingBrowsers.length}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {remainingBrowsers.map((browser) => (
              <DropdownMenuItem key={browser.id} className="pointer-events-none">
                <img src={`data:image/png;base64,${browser.logo}`} alt={browser.name} height={18} width={18} />
                {browser.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

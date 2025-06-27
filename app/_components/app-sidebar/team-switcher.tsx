"use client";

import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function TeamSwitcher({
  teams,
  website,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
  website: any;
}) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className={`
            group relative w-full pointer-events-none hover:bg-transparent
            ${isCollapsed ? 'h-12 p-2 justify-center' : 'h-14 p-3'}
          `}
        >
          {isCollapsed ? (
            // Collapsed state - show only logo
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {website?.logo?.data ? (
                <img
                  src={`data:${website?.logo?.contentType};base64,${website?.logo?.data}`}
                  alt={website?.logo.name || "Website Logo"}
                  className="h-5 w-5 object-contain"
                />
              ) : (
                <activeTeam.logo className="h-4 w-4" />
              )}
            </div>
          ) : (
            // Expanded state - show logo and text
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex-shrink-0">
                {website?.logo?.data ? (
                  <img
                    src={`data:${website?.logo?.contentType};base64,${website?.logo?.data}`}
                    alt={website?.logo.name || "Website Logo"}
                    className="h-6 w-6 object-contain"
                  />
                ) : (
                  <activeTeam.logo className="h-5 w-5" />
                )}
              </div>
              
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-sidebar-foreground text-sm leading-tight">
                  {website?.websiteName ? website?.websiteName : activeTeam?.name}
                </span>
                <span className="text-xs text-sidebar-foreground/60 font-normal">
                  {activeTeam.plan}
                </span>
              </div>
            </div>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import toasterService from "@/app/_services/toaster-service"
import { IWebsite } from "@/app/_interface/website"
import { getWebsiteService } from "@/app/_services/setting.service"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);
  const [websiteData, setWebsite] = React.useState<IWebsite>();

  const website = async () => {
    try {
      const response = await getWebsiteService();
      setWebsite(response);
    } catch (error) {
      toasterService.error();
    }
  }

  React.useEffect(() => {
    website();
  }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="pointer-events-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            {websiteData?.logo?.data ? (
              <img
                src={`data:${websiteData?.logo?.contentType};base64,${websiteData?.logo?.data}`}
                alt={websiteData.logo.name || "Website Logo"}
                className=" size-9"
              />
            ) : (
              <activeTeam.logo className="size-4" />
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {websiteData?.websiteName ? websiteData?.websiteName : activeTeam?.name}
            </span>
            <span className="truncate text-xs">{activeTeam.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

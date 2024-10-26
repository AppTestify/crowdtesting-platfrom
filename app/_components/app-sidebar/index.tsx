"use client"

import * as React from "react"
import {
    Calendar, Home, Inbox, Search, Settings, Frame,
    GalleryVerticalEnd,
    Map,
    PieChart,
    Command,
    MonitorSmartphone,
    User,
} from "lucide-react"

import { NavMain } from "@/app/_components/app-sidebar/nav-main"
import { NavProjects } from "@/app/_components/app-sidebar/nav-projects"
import { NavUser } from "@/app/_components/app-sidebar/nav-user"
import { TeamSwitcher } from "@/app/_components/app-sidebar/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { DashboardIcon } from "@radix-ui/react-icons"

// This is sample data.
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    teams: [
        {
            name: "Crowd Testing",
            logo: Command,
            plan: "AppTestify",
        },
    ],
    navMain: [
        {
            title: "Dashboard",
            url: "/private/dashboard",
            icon: DashboardIcon,
        },
        {
            title: "Projects",
            url: "/private/projects",
            icon: GalleryVerticalEnd,
        },
        {
            title: "Devices",
            url: "/private/devices",
            icon: MonitorSmartphone,
        },
        {
            title: "Profile",
            url: '/private/profile',
            icon: User,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

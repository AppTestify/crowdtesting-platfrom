"use client"

import * as React from "react"

import { NavMain } from "@/app/_components/app-sidebar/nav-main"
import { NavUser } from "@/app/_components/app-sidebar/nav-user"
import { TeamSwitcher } from "@/app/_components/app-sidebar/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { navMain, teams } from "@/app/_constants/sidebar"
import { useSession } from "next-auth/react"
import { toTitleCase } from "@/app/_utils/sting-formatters"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data } = useSession();
    const [identity, setIdentity] = React.useState<{
        name: string
        email: string
    } | null>(null);

    React.useEffect(() => {
        if (data) {
            const { user } = data;
            setUserIdentity(user);
        }
    }, [data]);

    const setUserIdentity = async (user: any) => {
        if (user?.firstName && user?.lastName) {
            setIdentity({ name: toTitleCase(`${user.firstName} ${user.lastName}`), email: user.email });
        } else {
            setIdentity({ name: toTitleCase(user.name), email: user.email });
        }
    }


    return (
        <>
            <Sidebar collapsible="icon" {...props}>
                <SidebarHeader>
                    <TeamSwitcher teams={teams} />
                </SidebarHeader>
                <SidebarContent>
                    <NavMain items={navMain} />
                </SidebarContent>
                <SidebarFooter>
                    <NavUser user={identity} />
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>

        </>
    )
}

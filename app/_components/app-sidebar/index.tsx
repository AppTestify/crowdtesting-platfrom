"use client";

import * as React from "react";

import { NavMain } from "@/app/_components/app-sidebar/nav-main";
import { NavUser } from "@/app/_components/app-sidebar/nav-user";
import { TeamSwitcher } from "@/app/_components/app-sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getSidebarItems, navMain, teams } from "@/app/_constants/sidebar";
import { useSession } from "next-auth/react";
import { toTitleCase } from "@/app/_utils/string-formatters";
import { IWebsite } from "@/app/_interface/website";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data } = useSession();
  const [identity, setIdentity] = React.useState<{
    name: string;
    email: string;
    profilePicture?: any;
  } | null>(null);
  const [user, setUser] = React.useState<any>();
  const [website, setWebsite] = React.useState<any>();

  React.useEffect(() => {
    if (data) {
      const { user } = data;
      setWebsite(data);
      setUserIdentity(user);
      setUser(user);
    }
  }, [data]);

  const setUserIdentity = async (user: any) => {
    if (user?.firstName && user?.lastName) {
      setIdentity({
        name: toTitleCase(`${user.firstName} ${user.lastName}`),
        email: user.email,
        profilePicture: user.profilePicture || null,
      });
    } else {
      setIdentity({
        name: toTitleCase(user.name),
        email: user.email,
        profilePicture: user.profilePicture || null,
      });
    }
  };

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={teams} user={website} />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={getSidebarItems(user)} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={identity} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}

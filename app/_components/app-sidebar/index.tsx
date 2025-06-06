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
import { getSidebarItems, teams } from "@/app/_constants/sidebar";
import { useSession } from "next-auth/react";
import { toTitleCase } from "@/app/_utils/string-formatters";
import toasterService from "@/app/_services/toaster-service";
import { getProfilePictureService } from "@/app/_services/user.service";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data } = useSession();
  const [identity, setIdentity] = React.useState<{
    name: string;
    email: string;
    profilePicture?: any;
  } | null>(null);
  const [user, setUser] = React.useState<any>();
  const [sessionData, setSessionData] = React.useState<any>();
  const [profile, setProfile] = React.useState<any>();

  const getProfile = async () => {
    try {
      const response = await getProfilePictureService();
      if (response) {
        setProfile(response);
      }
    } catch (error) {
      toasterService.error();
    }
  }

  React.useEffect(() => {
    if (data) {
      const { user } = data;
      setSessionData(data);
      setUserIdentity(user);
      setUser(user);
    }
  }, [data]);

  React.useEffect(() => {
    getProfile();
  }, []);

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
          {sessionData && <TeamSwitcher teams={teams} website={sessionData.website} />}
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={getSidebarItems(user)} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={identity} profile={profile} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}

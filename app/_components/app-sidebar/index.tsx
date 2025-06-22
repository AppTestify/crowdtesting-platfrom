"use client";

import * as React from "react";

import { NavMain } from "@/app/_components/app-sidebar/nav-main";
import { NavUser } from "@/app/_components/app-sidebar/nav-user";
import { TeamSwitcher } from "@/app/_components/app-sidebar/team-switcher";
import { SearchBar } from "@/app/_components/app-sidebar/search-bar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getSidebarItems, teams } from "@/app/_constants/sidebar";
import { useSession } from "next-auth/react";
import { toTitleCase } from "@/app/_utils/string-formatters";
import toasterService from "@/app/_services/toaster-service";
import { getProfilePictureService } from "@/app/_services/user.service";
import { Separator } from "@/components/ui/separator";

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
      <Sidebar collapsible="icon" {...props} className="border-r-0">
        <SidebarHeader className="border-b border-sidebar-border/50 bg-gradient-to-b from-sidebar-accent/10 to-transparent">
          <div className="flex items-center justify-between px-1">
            {sessionData && <TeamSwitcher teams={teams} website={sessionData.website} />}
            <SidebarTrigger className="ml-auto hover:bg-sidebar-accent/20 transition-colors" />
          </div>
          <div className="px-1 pb-2">
            <SearchBar />
          </div>
        </SidebarHeader>
        
        <SidebarContent className="px-2 py-2">
          <NavMain items={getSidebarItems(user) || []} />
        </SidebarContent>
        
        <SidebarFooter className="border-t border-sidebar-border/50 bg-gradient-to-t from-sidebar-accent/5 to-transparent">
          <NavUser user={identity} profile={profile} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}

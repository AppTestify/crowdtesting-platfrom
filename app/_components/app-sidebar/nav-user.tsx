"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { logOutUserService } from "@/app/_services/auth-service";
import toasterService from "@/app/_services/toaster-service";
import {
  getAvatarFallbackText,
  getFormattedBase64ForSrc,
} from "@/app/_utils/string-formatters";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export function NavUser({
  user,
  profile
}: {
  user: {
    name: string;
    email: string;
    profilePicture?: any;
  } | null;
  profile: any;
}) {
  const { isMobile, state } = useSidebar();
  const router = useRouter();
  const { data } = useSession();
  const [isAccountActive, setIsAccountActive] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      const sessionUser: any = data?.user;
      if (sessionUser?.isVerified) {
        setIsAccountActive(true);
      }
    }
  }, [data]);

  const logOutUser = async () => {
    signOut();
    await logOutUserService();
    router.push("/auth/sign-in");
    toasterService.success("Logged out successfully");
  };

  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenu>
      {/* Account Status Badge - Only show when sidebar is expanded */}
      {data?.user && !isCollapsed && (
        <div className="px-3 pb-2">
          <Badge 
            className="font-medium w-full justify-center text-xs" 
            variant={isAccountActive ? "default" : "secondary"}
          >
            {isAccountActive ? "Account Active" : "Account Inactive"}
          </Badge>
        </div>
      )}
      
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={getFormattedBase64ForSrc(profile)}
                  alt="@profilePicture"
                />

                <AvatarFallback className="rounded-lg">
                  {getAvatarFallbackText(user)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs">{user?.email || ""}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email || ""}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Show account status in dropdown when sidebar is collapsed */}
            {isCollapsed && data?.user && (
              <>
                <DropdownMenuItem disabled>
                  <Badge 
                    className="font-medium text-xs mr-2" 
                    variant={isAccountActive ? "default" : "secondary"}
                  >
                    {isAccountActive ? "Account Active" : "Account Inactive"}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => logOutUser()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User,
  Shield,
  Settings,
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
        <div className="px-3 pb-3">
          <div className={`
            flex items-center gap-2 p-3 rounded-lg transition-all duration-200
            ${isAccountActive 
              ? "bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20" 
              : "bg-gradient-to-r from-orange-500/10 to-yellow-500/5 border border-orange-500/20"
            }
          `}>
            <div className={`
              w-2 h-2 rounded-full animate-pulse
              ${isAccountActive ? "bg-green-500" : "bg-orange-500"}
            `} />
            <span className={`
              text-xs font-medium
              ${isAccountActive ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"}
            `}>
              {isAccountActive ? "Account Active" : "Verification Pending"}
            </span>
            {isAccountActive && <Shield className="w-3 h-3 text-green-600 dark:text-green-400 ml-auto" />}
          </div>
        </div>
      )}
      
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group relative data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
            >
              <div className="relative">
                <Avatar className="h-8 w-8 rounded-lg ring-2 ring-sidebar-border/30 group-hover:ring-sidebar-accent/50 transition-all duration-200">
                  <AvatarImage
                    src={getFormattedBase64ForSrc(profile)}
                    alt="@profilePicture"
                    className="transition-transform duration-200 group-hover:scale-105"
                  />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-sidebar-primary/20 to-sidebar-accent/20 text-sidebar-foreground font-semibold">
                    {getAvatarFallbackText(user)}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar animate-pulse" />
              </div>
              
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold group-hover:text-sidebar-accent-foreground transition-colors">
                  {user?.name}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground/80 transition-colors">
                  {user?.email || ""}
                </span>
              </div>
              
              <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground transition-all duration-200 group-data-[state=open]:rotate-180" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg shadow-lg border-sidebar-border/50 bg-sidebar"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-3 text-left text-sm bg-gradient-to-r from-sidebar-accent/5 to-transparent">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage
                    src={getFormattedBase64ForSrc(profile)}
                    alt="@profilePicture"
                  />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-sidebar-primary/20 to-sidebar-accent/20">
                    {getAvatarFallbackText(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-sidebar-foreground">
                    {user?.name}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    {user?.email || ""}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="bg-sidebar-border/30" />
            
            {/* Show account status in dropdown when sidebar is collapsed */}
            {isCollapsed && data?.user && (
              <>
                <DropdownMenuItem disabled className="px-3 py-2">
                  <div className={`
                    flex items-center gap-2 w-full p-2 rounded-md
                    ${isAccountActive 
                      ? "bg-green-500/10 text-green-700 dark:text-green-400" 
                      : "bg-orange-500/10 text-orange-700 dark:text-orange-400"
                    }
                  `}>
                    <div className={`
                      w-2 h-2 rounded-full animate-pulse
                      ${isAccountActive ? "bg-green-500" : "bg-orange-500"}
                    `} />
                    <span className="text-xs font-medium">
                      {isAccountActive ? "Account Active" : "Verification Pending"}
                    </span>
                    {isAccountActive && <Shield className="w-3 h-3 ml-auto" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-sidebar-border/30" />
              </>
            )}
            
            <DropdownMenuGroup>
              <DropdownMenuItem 
                onClick={() => router.push("/private/profile")}
                className="px-3 py-2 cursor-pointer hover:bg-sidebar-accent/50 transition-colors"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => router.push("/private/settings")}
                className="px-3 py-2 cursor-pointer hover:bg-sidebar-accent/50 transition-colors"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => router.push("/private/notifications")}
                className="px-3 py-2 cursor-pointer hover:bg-sidebar-accent/50 transition-colors"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0.5">
                  3
                </Badge>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="bg-sidebar-border/30" />
            
            <DropdownMenuItem 
              onClick={() => logOutUser()}
              className="px-3 py-2 cursor-pointer text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

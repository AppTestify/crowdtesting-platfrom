"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  disabled: boolean;
  badge?: string;
  isNew?: boolean;
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  // Group navigation items logically
  const groupedItems = {
    main: items?.filter(item => 
      ["Dashboard", "Projects"].includes(item.title)
    ) || [],
    management: items?.filter(item => 
      ["Users", "Devices", "Emails", "Documents"].includes(item.title)
    ) || [],
    financial: items?.filter(item => 
      ["Payments", "Invoice", "Pricing"].includes(item.title)
    ) || [],
    account: items?.filter(item => 
      ["Profile", "Settings"].includes(item.title)
    ) || [],
  };

  const handleNavClick = () => {
    // Close mobile sidebar when navigation item is clicked
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderNavGroup = (groupItems: NavItem[], groupName: string, groupLabel?: string) => {
    if (!groupItems.length) return null;

    return (
      <SidebarGroup key={groupName}>
        {groupLabel && (
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider px-2 py-1">
            {groupLabel}
          </SidebarGroupLabel>
        )}
        <SidebarGroupContent>
          <SidebarMenu className="space-y-1">
            {groupItems.map((item) => {
              const isActive = pathname.startsWith(item.url);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    disabled={item.disabled}
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={`
                      group relative transition-all duration-200 hover:scale-[1.02] hover:shadow-sm
                      ${isActive 
                        ? "bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 text-sidebar-accent-foreground shadow-sm" 
                        : "hover:bg-sidebar-accent/50"
                      }
                      ${item.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                      }
                    `}
                  >
                    <Link
                      href={item.disabled ? "#" : item.url}
                      onClick={(e) => {
                        if (item.disabled) {
                          e.preventDefault();
                        } else {
                          handleNavClick();
                        }
                      }}
                      className={`flex items-center gap-3 w-full ${
                        item.disabled
                          ? "text-sidebar-foreground/40 pointer-events-none"
                          : ""
                      }`}
                    >
                      <item.icon className={`h-4 w-4 transition-transform duration-200 ${
                        isActive ? "scale-110" : "group-hover:scale-105"
                      }`} />
                      <span className="font-medium">{item.title}</span>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute right-2 w-2 h-2 rounded-full bg-sidebar-accent-foreground/80" />
                      )}
                      
                      {/* New badge */}
                      {item.isNew && (
                        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                          NEW
                        </Badge>
                      )}
                      
                      {/* Custom badge */}
                      {item.badge && (
                        <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0.5">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <div className="space-y-4">
      {renderNavGroup(groupedItems.main, "main")}
      {renderNavGroup(groupedItems.management, "management", "Management")}
      {renderNavGroup(groupedItems.financial, "financial", "Financial")}
      {renderNavGroup(groupedItems.account, "account", "Account")}
    </div>
  );
}

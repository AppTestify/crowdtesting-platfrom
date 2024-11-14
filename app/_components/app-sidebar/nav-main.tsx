"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"

export function NavMain({
  items,
}: any) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items?.map((item: any) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton disabled={item.disabled}
                asChild isActive={pathname === item.url} tooltip={item.title}>
                <Link href={item.disabled ? "#" : item.url}
                  onClick={(e) => item.disabled && e.preventDefault()}
                  className={` ${item.disabled ? "text-gray-400 cursor-not-allowed pointer-events-none" : ""
                    }`}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

"use client";

import * as React from "react";
import { Search, Command } from "lucide-react";
import { SidebarInput } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";

export function SearchBar() {
  const { state } = useSidebar();
  const [searchQuery, setSearchQuery] = React.useState("");
  const isCollapsed = state === "collapsed";

  if (isCollapsed) {
    return null;
  }

  return (
    <div className="relative group">
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50 transition-colors group-focus-within:text-sidebar-accent-foreground" />
      <SidebarInput
        type="search"
        placeholder="Search or type a command..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-8 pr-8 bg-sidebar-accent/20 border-sidebar-border/30 placeholder:text-sidebar-foreground/50 focus-visible:ring-sidebar-ring/50 focus-visible:bg-sidebar-accent/30 transition-all duration-200"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-sidebar-border/50 bg-sidebar-accent/30 px-1.5 font-mono text-[10px] font-medium text-sidebar-foreground/70 opacity-100 sm:flex">
          <Command className="h-3 w-3" />
          K
        </kbd>
      </div>
    </div>
  );
} 
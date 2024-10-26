"use client"

import * as React from "react"
import { useSession, } from "next-auth/react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { navMain } from "@/app/_constants/sidebar"
import { Badge } from "@/components/ui/badge"

export function Navbar() {
    const pathname = usePathname();
    const { data } = useSession();
    const [isAccountActive, setIsAccountActive] = useState<boolean>(false);

    useEffect(() => {
        if (data) {
            const user: any = data?.user;
            if (user?.isVerified) {
                setIsAccountActive(true)
            }
        }
    }, [data]);

    const getActivePageTitle = () => {
        return navMain.find((item) => pathname === item.url)?.title || ""
    }


    return (
        <header className="border-b flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex justify-between w-full pr-4">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>{getActivePageTitle()}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                {data?.user && <Badge variant={isAccountActive ? 'default' : 'secondary'}>
                    {isAccountActive ? 'Account Active' : 'Account Inactive' }</Badge>}
            </div>
        </header>
    )
}

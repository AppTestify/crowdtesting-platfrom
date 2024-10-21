"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Icons } from "@/components/icons"
import { signOut, useSession, } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import toasterService from "@/app/_services/toaster-service"
import { logOutUserService } from "@/app/_services/auth-service"
import Cookies from 'js-cookie';
import { toTitleCase } from "@/app/_utils/sting-formtters"
import { getUserByEmailService } from "@/app/_services/user.service"
import { setItem } from "@/app/_services/localstorage"
import { StorageKey } from "@/app/_constants/localstorage-keys"


const routes = [
    { id: "dashboard", label: "Dashboard", link: "/private/dashboard" },
    { id: "projects", label: "Projects", link: "/private/projects" },
    { id: "devices", label: "Devices", link: "/private/devices" },
];

export function Navbar() {
    const router = useRouter();
    const { data } = useSession();
    const [identity, setIdentity] = useState<string>("");

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserIdentity(user);
            setClientSessionStorage(user);
        }
    }, [data]);

    const setClientSessionStorage = async (user: any) => {
        try {
            if (user?.email) {
                const principalUser = await getUserByEmailService(user?.email);
                setItem(StorageKey.PRINCIPAL_USER, principalUser)
            }
        } catch (error) {
            console.error(`Error > setClientSessionStorage:`, error);
        }
    }

    const setUserIdentity = async (user: any) => {
        if (user?.name) {
            setIdentity(toTitleCase(user.name));
        } else if (user?.email) {
            setIdentity(user.email)
        }

    }


    const logOutUser = () => {
        signOut();
        logOutUserService();
        router.push('/auth/sign-in');
        toasterService.success('Logged out successfully');
    }

    return (
        <div className="flex px-2 py-2 w-full justify-between relative border-b">
            <NavigationMenu>
                <NavigationMenuList>
                    {routes.map((route) => (
                        <NavigationMenuItem key={route.id}>
                            <Link href={`${route.link}`} legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                    {route.label}
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>
            <DropdownMenu>
                <DropdownMenuTrigger className="px-2">{identity}</DropdownMenuTrigger>
                <DropdownMenuContent className="mr-2">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logOutUser()}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"

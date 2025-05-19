"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import AddOnModel from "./_components/add-on";
import PackageModel from "./_components/package-model";

export default function Package() {
    const { data } = useSession();
    const router = useRouter();
    const [userData, setUserData] = useState<any>();
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const userParam = searchParams.get("user");
        setUser(userParam);
    }, []);

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    useEffect(() => {
        if (userData && userData?.role !== UserRoles.ADMIN) {
            router.push('/private/dashboard');
        }
    }, [userData, router]);

    if (userData?.role !== UserRoles.ADMIN) {
        return (
            <div className="p-4">
                <Skeleton className="h-6 w-[200px] bg-gray-200" />
                <Skeleton className="h-4 w-[550px] mt-2 bg-gray-200" />
                <Skeleton className="h-10 w-[400px] mt-4 bg-gray-200" />
                <Skeleton className="h-8 w-[380px] mt-8 bg-gray-200" />
                <Skeleton className="h-40 w-full mt-4 bg-gray-200" />
            </div>
        );
    }

    return (
        <main className='mx-4 mt-4'>
            <div className="flex flex-col mb-3 gap-1 mt-2">
                <h2 className="font-medium text-xl text-primary">Package Model</h2>
            </div>
            <div className="mt-3">
            <Tabs defaultValue={user ? "addon" : "package"} >
                <TabsList className="grid grid-cols-2 w-[400px]">
                    <TabsTrigger value="package">Package</TabsTrigger>
                    <TabsTrigger value="addon">Addon</TabsTrigger>
                </TabsList>
                <TabsContent value="package">
                    <PackageModel />
                </TabsContent>
                <TabsContent value="addon">
                    <AddOnModel />
                </TabsContent>
            </Tabs>
            </div>
        </main>
    );
}


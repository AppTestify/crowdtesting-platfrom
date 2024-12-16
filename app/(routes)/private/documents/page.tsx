"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VerifiedDocuments from "./_components/verified";
import NonVerifiedDocument from "./_components/non-verified";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Documents() {
    const { data } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [userData, setUserData] = useState<any>();
    const user = searchParams.get('user');

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
                <h2 className="font-medium text-xl text-primary">Documents approval</h2>
                <span className="text-xs text-gray-600">
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Cum corrupti laborum velit culpa unde pariatur.
                </span>
            </div>
            <Tabs defaultValue={user ? "nonVerified" : "verified"} className=" mt-3">
                <TabsList className="grid grid-cols-2 w-[400px]">
                    <TabsTrigger value="verified">Verified document</TabsTrigger>
                    <TabsTrigger value="nonVerified">Non verified document</TabsTrigger>
                </TabsList>
                <TabsContent value="verified">
                    <NonVerifiedDocument />
                </TabsContent>
                <TabsContent value="nonVerified">
                    <VerifiedDocuments />
                </TabsContent>
            </Tabs>
        </main>
    );
}

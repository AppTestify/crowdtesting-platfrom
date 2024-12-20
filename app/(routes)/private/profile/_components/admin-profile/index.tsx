"use client";
import React from "react";
import EditProfilePicture from "../edit-profile-picture";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminProfileTabs } from "./_constants";
import AdminProfileOverview from "./_components/overview";
import PasswordSetting from "../profile-password-setting";

export default function AdminProfile({ user }: { user: any }) {
    return (
        <>
            <div className="border-b pb-3">
                <h2 className="font-medium text-xl text-primary">Profile Overview</h2>
            </div>
            <div className="my-4">
                <EditProfilePicture user={user} />
                <Separator className="my-4" />
                <Tabs defaultValue={AdminProfileTabs.OVERVIEW}>
                    <TabsList className="grid grid-cols-2 mb-4 w-full md:w-fit">
                        <TabsTrigger
                            value={AdminProfileTabs.OVERVIEW}
                            className="flex items-center"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value={AdminProfileTabs.SETTINGS}
                            className="flex items-center"
                        >
                            Settings
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value={AdminProfileTabs.OVERVIEW} className="w-full">
                        <AdminProfileOverview user={user} />
                    </TabsContent>
                    <TabsContent value={AdminProfileTabs.SETTINGS} className="w-full">
                        <PasswordSetting />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
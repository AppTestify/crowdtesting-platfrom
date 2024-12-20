"use client";
import React, { useEffect, useState } from "react";
import EditProfilePicture from "../edit-profile-picture";
import ProfileOverview from "./_components/overview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TesterProfileTabs } from "./_constants";
import { Separator } from "@/components/ui/separator";
import Documents from "./_components/documents";
import Payment from "../payment";
import PasswordSetting from "../profile-password-setting";

export default function TesterProfile({ user }: { user: any }) {
  return (
    <>
      <div className="border-b pb-3">
        <h2 className="font-medium text-xl text-primary">Profile Overview</h2>
      </div>
      <div className="my-4">
        <EditProfilePicture user={user} />
        <Separator className="my-4" />
        <Tabs defaultValue={TesterProfileTabs.OVERVIEW} className="w-full mt-4">
          <TabsList className="grid grid-cols-4 mb-4 w-full md:w-fit">
            <TabsTrigger
              value={TesterProfileTabs.OVERVIEW}
              className="flex items-center"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value={TesterProfileTabs.DOCUMENTS}
              className="flex items-center"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger
              value={TesterProfileTabs.PAYMENT}
              className="flex items-center"
            >
              Payments
            </TabsTrigger>
            <TabsTrigger
              value={TesterProfileTabs.SETTINGS}
              className="flex items-center"
            >
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value={TesterProfileTabs.OVERVIEW} className="w-full">
            <ProfileOverview user={user} />
          </TabsContent>
          <TabsContent value={TesterProfileTabs.DOCUMENTS} className="w-full">
            <Documents />
          </TabsContent>
          <TabsContent value={TesterProfileTabs.PAYMENT} className="w-full">
            <Payment user={user} />
          </TabsContent>
          <TabsContent value={TesterProfileTabs.SETTINGS} className="w-full">
            <PasswordSetting />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

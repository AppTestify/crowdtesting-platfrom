import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabsVertical";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UserInfo from "./userInfo";
import Projects from "./past-projects";
import PastProjects from "./past-projects";
import Certifications from "./certifications";

const Profile = () => {
  return (
    <>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>Manage your Profile</CardDescription>
        <Separator className="my-4" />
      </CardHeader>

      <CardContent className="flex space-x-4">
        <Tabs defaultValue="userInfo" className="flex w-full">
          <div className="w-[20%]">
            <TabsList
              orientation="vertical"
              className="flex flex-col space-y-2  pt-2"
            >
              <TabsTrigger value="userInfo" className="p-2">
                User Info
              </TabsTrigger>
              <TabsTrigger value="device" className="p-2">
                Devices
              </TabsTrigger>
              <TabsTrigger value="pastProjects" className="p-2">
                Past Projects
              </TabsTrigger>
              <TabsTrigger value="certifications" className="p-2">
                Certifications
              </TabsTrigger>
              <TabsTrigger value="skill" className="p-2">
                Skills
              </TabsTrigger>
              <TabsTrigger value="browser" className="p-2">
                Browsers
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="w-[80%]">
            <TabsContent value="userInfo">
              <UserInfo />
            </TabsContent>

            <TabsContent value="pastProjects">
              <PastProjects />
            </TabsContent>
            <TabsContent value="certifications">
              <Certifications />
            </TabsContent>

            <TabsContent value="skill">
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input id="job-title" placeholder="Software Engineer" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="years">Years of Experience</Label>
                  <Input id="years" type="number" placeholder="5" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Experience</Button>
              </CardFooter>
            </TabsContent>
            <TabsContent value="device">
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input id="job-title" placeholder="Software Engineer" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="years">Years of Experience</Label>
                  <Input id="years" type="number" placeholder="5" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Experience</Button>
              </CardFooter>
            </TabsContent>

            <TabsContent value="browser">
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input id="job-title" placeholder="Software Engineer" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="years">Years of Experience</Label>
                  <Input id="years" type="number" placeholder="5" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Experience</Button>
              </CardFooter>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </>
  );
};

export default Profile;

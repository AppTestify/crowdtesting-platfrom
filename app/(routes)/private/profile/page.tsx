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
import { profileSideBarItems } from "@/app/_constants/profile-sidebar";
import AboutMe from "./about-me";
import CertificateListing from "./certificate-listing";

// shared some skills use them
const DefaultSkills = [
  {
    value: "manualTesting",
    label: "Manual Testing",
  },
  {
    value: "automationTesting",
    label: "Automation Testing",
  },
  {
    value: "sqlAndDataBase",
    label: "SQL and Database Skills",
  },
  {
    value: "apiTesting",
    label: "API Testing",
  },
  {
    value: "performancetesting",
    label: "Performance Testing",
  },
  {
    value: "cicdTool",
    label: "CI/CD Tools",
  },
  {
    value: "mobileTesting",
    label: "Mobile Testing",
  },
];
const Defaultcertificates = [
  {
    value: "istqb",
    label: "ISTQB (International Software Testing Qualifications Board)",
  },
  {
    value: "cste",
    label: "Certified Software Tester (CSTE)",
  },
  {
    value: "csqa",
    label: "Certified Software Quality Analyst (CSQA)",
  },
  {
    value: "cast",
    label: "Certified Associate in Software Testing (CAST)",
  },
  {
    value: "cmst",
    label: "Certified Manager of Software Testing (CMST)",
  },
  {
    value: "icpTst",
    label:
      "Agile Testing Certification (ICAgile Certified Professional in Agile Testing - ICP-TST)",
  },
  {
    value: "atm",
    label: "Automation Testing Certifications",
  },
  {
    value: "cmt",
    label: "Certified Mobile Tester (CMT)",
  },
];
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
              {profileSideBarItems?.map((item) => {
                return (
                  <TabsTrigger value={item.value} className="p-2" key={item.id}>
                    {item.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="w-[80%]">
            <TabsContent value="userInfo">
              <UserInfo />
            </TabsContent>

            <TabsContent value="certifications">
              <CertificateListing Defaultcertificates={Defaultcertificates}  info={"Certificate"} />
            </TabsContent>

            <TabsContent value="skill">
              <CertificateListing Defaultcertificates={DefaultSkills} info={"Skill"} />
            </TabsContent>

            <TabsContent value="aboutMe">
              <AboutMe />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </>
  );
};

export default Profile;

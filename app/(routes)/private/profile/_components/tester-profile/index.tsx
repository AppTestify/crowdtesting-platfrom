"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Certificate, Skill } from "@/app/_interface/tester";
import AboutMe from "../about-me";
import ItemListing from "../item-listing";
import UserInfo from "../userInfo";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TesterProfileTabs } from "@/app/_constants/profile";
import EditProfilePicture from "../edit-profile-picture";
import { cn } from "@/lib/utils";
import { BellRing, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/text-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries, ICountry } from "@/app/_constants/countries";

const DefaultSkills: Skill[] = [
  {
    value: "manualTesting",
    label: "Manual Testing",
  },
  {
    value: "automatedTesting",
    label: "Automated Testing",
  },
  {
    value: "testCaseDesign",
    label: "Test Case Design",
  },
  {
    value: "regressionTesting",
    label: "Regression Testing",
  },
  {
    value: "functionaltesting",
    label: "Functional Testing",
  },
  {
    value: "performancetesting",
    label: "Performance Testing",
  },
  {
    value: "loadtesting",
    label: "Load Testing",
  },
  {
    value: "userAcceptancetesting",
    label: "User Acceptance Testing (UAT)",
  },
  {
    value: "bugTracking",
    label: "Bug Tracking",
  },
  {
    value: "crossBrowserTesting",
    label: "Cross-Browser Testing",
  },
  {
    value: "testMangTool",
    label: "Test Management Tools",
  },
  {
    value: "agileMethodologies",
    label: "Agile Methodologies",
  },
  {
    value: "sqlAndDataBase",
    label: "SQL and Database Skills",
  },
  {
    value: "versionControlSys",
    label: "Version Control Systems",
  },
  {
    value: "scriptingLanguage",
    label: "Scripting Languages",
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
    label: "Continuous Integration/Continuous Deployment",
  },
  {
    value: "mobileTesting",
    label: "Mobile Testing",
  },
  {
    value: "securityTesting",
    label: "Security Testing",
  },
];

const Defaultcertificates: Certificate[] = [
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
  {
    value: "cst",
    label: "Certified Selenium Tester",
  },
];

const notifications = [
  {
    title: "Your call has been confirmed.",
    description: "1 hour ago",
  },
  {
    title: "You have a new message!",
    description: "1 hour ago",
  },
  {
    title: "Your subscription is expiring soon!",
    description: "2 hours ago",
  },
];

const formSchema = z.object({
  firstName: z.string().min(1, {
    message: "Required",
  }),
  lastName: z.string().min(1, {
    message: "Required",
  }),
  bio: z.string(),
  country: z.string().min(1, {
    message: "Required",
  }),
  city: z.string().min(1, {
    message: "Required",
  }),
  street: z.string().min(1, {
    message: "Required",
  }),
  postalCode: z.string().min(1, {
    message: "Required",
  }),
});

export default function TesterProfile({ user }: { user: any }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: user?.bio || "",
      country: user?.address?.country || "",
      city: user?.address?.city || "",
      street: user?.address?.street || "",
      postalCode: user?.address?.postalCode || "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <>
      <div className="border-b pb-3">
        <h2 className="font-medium text-xl text-primary">Profile Overview</h2>
        <span className="text-xs text-gray-600">
          Your profile information helps us recommend projects and tailor
          resources to support your development.
        </span>
      </div>
      <div className="my-4">
        <EditProfilePicture user={user} />
        <div className="mt-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col"
            >
              <div>
                <div className="flex flex-col mb-3 gap-1">
                  <span className="text-lg">Personal information</span>
                  <span className="text-gray-500 text-xs">
                    Your personal information helps us tailor projects and
                    resources to better suit your background and expertise.
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className={"w-full"}>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className={"w-full"}>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea className="resize-none" {...field} />
                        </FormControl>
                        <FormDescription>
                          Tell us a little bit about yourself
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="my-5" />

              <div>
                <div className="flex flex-col mb-3 gap-1">
                  <span className="text-lg">Address information</span>
                  <span className="text-gray-500 text-xs">
                    We use your address details to assign projects that best
                    match your location, ensuring suitability and relevance.
                  </span>
                </div>

                <div className="flex gap-4 items-center">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className={"flex-[4]"}>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem className={"flex-[2]"}>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((country: ICountry) => (
                                <SelectItem
                                  key={country._id}
                                  value={country.description}
                                >
                                  {country.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className={"flex-[2]"}>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem className={"flex-[2]"}>
                        <FormLabel>Postcode</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="w-full flex justify-end mt-4">
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </Form>
        </div>

        {/* <UserInfo />
        <ItemListing defualtItems={Defaultcertificates} info={"Certificate"} />
        <ItemListing defualtItems={DefaultSkills} info={"Skill"} /> */}
      </div>
    </>
  );
}

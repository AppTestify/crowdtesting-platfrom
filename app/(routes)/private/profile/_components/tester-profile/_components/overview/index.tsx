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

import React, { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/text-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries, ICountry } from "@/app/_constants/countries";
import { Loader2 } from "lucide-react";
import {
  getTesterByUserIdService,
  updateTesterProfile,
} from "@/app/_services/tester.service";
import toasterService from "@/app/_services/toaster-service";
import { useSession } from "next-auth/react";
import Certifications, { ICertification } from "../certifications";
import Skills, { ISkill } from "../skills";

export const certificationSchema = z.object({
  name: z.string().min(1, "Required"),
  issuedBy: z.string().optional(),
});

const formSchema = z.object({
  firstName: z.string().min(1, {
    message: "Required",
  }),
  lastName: z.string().min(1, {
    message: "Required",
  }),
  bio: z.string().optional(),
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
  certifications: z.array(certificationSchema).min(1),
  skills: z
    .array(
      z.string().min(1, {
        message: "Required",
      })
    )
    .min(1),
});

export type ITesterPayload = z.infer<typeof formSchema>;

export default function ProfileOverview({ user }: { user: any }) {
  const { update } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      certifications: user?.certifications || [{ name: "", issuedBy: "" }],
      skills: user?.skills || [""],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const response = await updateTesterProfile({ ...values });

      if (response) {
        setIsLoading(false);
        toasterService.success(response?.message);
        update();
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  }

  const setFormDefaultValues = (testerProfile: any) => {
    form.reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: testerProfile?.bio || "",
      country: testerProfile?.address?.country || "",
      city: testerProfile?.address?.city || "",
      street: testerProfile?.address?.street || "",
      postalCode: testerProfile?.address?.postalCode || "",
      certifications: testerProfile?.certifications || [
        { name: "", issuedBy: "" },
      ],
      skills: testerProfile?.skills || [""],
    });
  };

  useEffect(() => {
    getTesterByUserId();
  }, []);

  const getTesterByUserId = async () => {
    setFormDefaultValues(await getTesterByUserIdService());
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        <div>
          <div className="flex flex-col mb-3 gap-1">
            <span className="text-lg">Personal information</span>
            <span className="text-gray-500 text-xs">
              Your personal information helps us tailor projects and resources
              to better suit your background and expertise.
            </span>
          </div>
          <div className="flex gap-4">
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
              We use your address details to assign projects that best match
              your location, ensuring suitability and relevance.
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
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
                        {field.value}
                        {!field.value ? <SelectValue /> : null}
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country: ICountry) => (
                          <SelectItem
                            key={country.description}
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

        <Separator className="my-5" />

        <div>
          <Certifications
            form={form}
            certifications={form.watch("certifications")}
            onChange={(certifications: ICertification[]) =>
              form.setValue("certifications", certifications)
            }
          />
        </div>

        <Separator className="my-5" />

        <div>
          <Skills
            form={form}
            skills={form.watch("skills")}
            onChange={(skills: ISkill[]) => form.setValue("skills", skills)}
          />
        </div>

        <div className="w-full flex justify-end mt-4">
          <Button
            disabled={isLoading || !form.formState.isValid}
            type="submit"
            className="w-full md:w-fit"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? "Saving profile" : "Save profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

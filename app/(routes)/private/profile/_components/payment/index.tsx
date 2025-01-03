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
import { updatePaymentService } from "@/app/_services/user.service";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  paypalId: z.string().min(1, {
    message: "Required",
  }),
});

export type IPaymentPayload = z.infer<typeof formSchema>;

export default function Payment({ user }: { user: any }) {
  const { update } = useSession();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPaypalId, setShowPaypalId] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paypalId: user?.paypalId || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await updatePaymentService({ ...values });

      if (response) {
        setIsLoading(false);
        update();
        toasterService.success(response?.message);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        <div>
          <div className="flex flex-col mb-3 gap-1">
            <span className="text-lg">Payment information</span>
          </div>
          <div className="flex gap-4 w-full md:w-[600px]">
            <FormField
              control={form.control}
              name="paypalId"
              render={({ field }) => (
                <FormItem className={"w-full"}>
                  <FormLabel>Paypal ID or UPI ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={showPaypalId ? "text" : "password"}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center gap-2">
                    <Checkbox
                      id="terms"
                      onCheckedChange={(checked) => {
                        setShowPaypalId(!!checked);
                      }}
                    />
                    <label
                      htmlFor="terms"
                      className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {showPaypalId ? "Hide" : "Show"} paypal ID or UPI ID
                    </label>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-8 w-fit">
              <Button
                disabled={isLoading || !form.formState.isValid}
                type="submit"
                className="w-fit md:w-fit"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isLoading ? "Saving payment" : "Save payment"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

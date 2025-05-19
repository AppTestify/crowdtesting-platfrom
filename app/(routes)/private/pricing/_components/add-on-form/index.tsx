"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/text-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Loader2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addonSchema } from "@/app/_schemas/addon.schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addAddonService } from "@/app/_services/addon.service";
import toasterService from "@/app/_services/toaster-service";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { useState } from "react";
import { PaymentCurrency, PaymentCurrencyList } from "@/app/_constants/payment";

export function AddOnForm({ refreshAddon }: { refreshAddon: () => void }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const form = useForm<z.infer<typeof addonSchema>>({
    resolver: zodResolver(addonSchema),
    defaultValues: {
      currency: PaymentCurrency.USD,
      isActive: true,
    },
  });

  async function onSubmit(values: z.infer<typeof addonSchema>) {
    setIsLoading(true);
    try {
      const response = await addAddonService(values);

      if (response) {
        if (response.status === HttpStatusCode.BAD_REQUEST) {
          toasterService.error(response?.message);
          return;
        }
        toasterService.success(response?.message);
        refreshAddon();
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setSheetOpen(false);
      setIsLoading(false);
    }
  }

  const resetForm = () => {
    form.reset();
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button onClick={() => resetForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Add On
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>AddOn Model Form</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            method="post"
          >
            <div className="mt-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Addon Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* <div className="mt-2 grid grid-cols-2 gap-2">

               <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Amount Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as "flat" | "percentage")
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="flat">Flat</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div> */}

            <div className="grid grid-cols-[30%,70%] gap-2">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {PaymentCurrencyList.map((currency) => (
                            <SelectItem value={currency as string}>
                              <div className="flex items-center">
                                {currency}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type={"number"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* <div className="grid  sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox
                            id="isActive"
                            className="h-5 w-5 text-blue-500 border-gray-300 "
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label htmlFor="isActive">Active</Label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div> */}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your message here."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-10 w-full flex justify-end gap-2">
              <SheetClose asChild>
                <Button
                  disabled={isLoading}
                  type="button"
                  variant={"outline"}
                  size="lg"
                  className="w-full md:w-fit"
                >
                  Cancel
                </Button>
              </SheetClose>
              <Button
                disabled={isLoading}
                type="submit"
                size="lg"
                className="w-full md:w-fit"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isLoading ? "Saving" : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

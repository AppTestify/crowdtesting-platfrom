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
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateAddonService } from "@/app/_services/addon.service";
import toasterService from "@/app/_services/toaster-service";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IAddon } from "@/app/_interface/addon";
import { PaymentCurrency, PaymentCurrencyList } from "@/app/_constants/payment";
import { addonSchema } from "@/app/_schemas/addon.schema";

const EditAddOnModel = ({
  addon,
  sheetOpen,
  setSheetOpen,
  refreshAddOn,
}: {
  addon: IAddon;
  sheetOpen: boolean;
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refreshAddOn: () => void;
}) => {
  const addonId = addon?.id as string;
  const { name, description, isActive, amount, currency } = addon;

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof addonSchema>>({
    resolver: zodResolver(addonSchema),
    defaultValues: {
      name: name || "",
      currency: currency || PaymentCurrency.USD,
      description: description || "",
      isActive: isActive || false,
      amount: amount || undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof addonSchema>) {
    setIsLoading(true);
    try {
      const response = await updateAddonService(addonId, values);
      if (response) {
        refreshAddOn();
        toasterService.success(response?.message);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setSheetOpen(false);
      setIsLoading(false);
    }
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Add-On</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            method="post"
          >
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Add On Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-[30%,70%] gap-2">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? PaymentCurrency.USD}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {PaymentCurrencyList.map((currency) => (
                            <SelectItem key={currency} value={currency}>
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

            <div className="grid  sm:grid-cols-2">
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
                        <Label htmlFor="isActive">IsActive</Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the add-on here."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetClose asChild>
              <div className="flex gap-5 justify-end">
                <Button
                  disabled={isLoading}
                  type="button"
                  variant={"outline"}
                  size="lg"
                  className="w-full md:w-fit"
                >
                  Cancel
                </Button>

                <Button
                  disabled={isLoading}
                  type="submit"
                  size="lg"
                  className="w-full md:w-fit"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isLoading ? "Updating" : "Update"}
                </Button>
              </div>
            </SheetClose>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default EditAddOnModel;

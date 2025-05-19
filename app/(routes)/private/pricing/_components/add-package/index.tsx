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
import { addPackageService } from "@/app/_services/package.service";
import { useState } from "react";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import toasterService from "@/app/_services/toaster-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { packageSchema } from "@/app/_schemas/package.schema";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentCurrency, PaymentCurrencyList } from "@/app/_constants/payment";
export function AddPackage({
  refreshPackages,
}: {
  refreshPackages: () => void;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const form = useForm<z.infer<typeof packageSchema>>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      currency: PaymentCurrency.USD,
      isActive: true,
    },
  });

  async function onSubmit(values: z.infer<typeof packageSchema>) {
    setIsLoading(true);
    try {
      const response = await addPackageService(values);

      if (response) {
        if (response.status === HttpStatusCode.BAD_REQUEST) {
          toasterService.error(response?.message);
          return;
        }
        toasterService.success(response?.message);
        refreshPackages();
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
          <Plus />
          Add Package
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Package Model</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-5"
            method="post"
          >
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="premium">Premium </SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="enterprises">Enterprises</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="testers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tester</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Days)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="testCase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Case</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="testExecution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Execution</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
            <div className="w-full">
              <FormField
                control={form.control}
                name="bugs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bugs</FormLabel>
                    <FormControl>
                      <Input className="w-full" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3">
              <div className="">
                <FormField
                  control={form.control}
                  name="moreBugs"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox
                            id="moreBug"
                            className="h-5 w-5 text-blue-500 border-gray-300 "
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label htmlFor="moreBug">More Bugs</Label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid  sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isCustom"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox
                            id="isCustom"
                            className="h-5 w-5 text-blue-500 border-gray-300 "
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label htmlFor="isCustom">Custom</Label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Loader2, Plus } from "lucide-react";
import { IPackage, IPackagePayload } from "@/app/_interface/package";
import { useState } from "react";
import { packageSchema } from "@/app/_schemas/package.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updatePackageService } from "@/app/_services/package.service";
import toasterService from "@/app/_services/toaster-service";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentCurrency, PaymentCurrencyList } from "@/app/_constants/payment";

const EditPackage = ({
  packages,
  sheetOpen,
  setSheetOpen,
  refreshPackages,
}: {
  packages: IPackage;
  sheetOpen: boolean;
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refreshPackages: () => void;
}) => {
  const packageId = packages?.id as string;
  const {
    type,
    name,
    testers,
    durationHours,
    bugs,
    amount,
    currency,
    moreBugs,
    isActive,
    isCustom,
    description,
    testCase,
    testExecution,
  } = packages;

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof packageSchema>>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      type: type || "",
      name: name || "",
      testers: testers || 0,
      durationHours: durationHours || undefined,
      bugs: bugs || undefined,
      amount: amount || undefined,
      moreBugs: moreBugs,
      isCustom: isCustom,
      isActive: isActive,
      description: description || "",
      currency: currency || PaymentCurrency.USD,
      testCase: testCase,
      testExecution: testExecution,
    },
  });

  async function onSubmit(values: z.infer<typeof packageSchema>) {
    setIsLoading(true);
    try {
      const response = await updatePackageService(packageId, values);
      if (response) {
        refreshPackages();
        toasterService.success(response?.message);
      }
    } catch (error) {
      toasterService.error();
      setSheetOpen(false);
      setIsLoading(false);
    } finally {
    }
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Package</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
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
                    <FormMessage />
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
                    <FormLabel>Duration (In Days)</FormLabel>
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

            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="bugs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bugs</FormLabel>
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
                          <Label htmlFor="isActive">Active</Label>
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

export default EditPackage;

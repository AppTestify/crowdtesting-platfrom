"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/text-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Loader2, Edit3, Package, Users, Clock, DollarSign, Bug, FileText, CheckCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
        setSheetOpen(false);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        {/* Balanced Header Design */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-100 mb-6">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Edit3 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-white/80 border-blue-200 text-blue-700">
                  Edit Package
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                Update Package Model
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-sm">
                Modify the pricing package configuration and features
              </DialogDescription>
            </div>
          </div>
        </div>
        
        <div className="px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method="post">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  </div>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2">Package Type</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={(value) => field.onChange(value)}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select Type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="free">Free</SelectItem>
                                  <SelectItem value="premium">Premium</SelectItem>
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
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2">Package Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter package name..." className="h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Testing Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Testing Configuration</h3>
                  </div>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="testers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2">Number of Testers</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter number of testers..." className="h-11" {...field} />
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
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2">Duration (In Days)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter duration..." className="h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="testCase"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2">Test Cases</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter test cases..." className="h-11" {...field} />
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
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2">Test Execution</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter test execution..." className="h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Pricing Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Pricing Details</h3>
                  </div>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2">Currency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select currency..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {PaymentCurrencyList.map((currency) => (
                                      <SelectItem key={currency} value={currency as string}>
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
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2">Amount</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter amount..." className="h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Features */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Bug className="h-4 w-4 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Additional Features</h3>
                  </div>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="bugs"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2">Number of Bugs</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter number of bugs..." className="h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="moreBugs"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Checkbox
                                      id="moreBug"
                                      className="h-5 w-5 text-green-500 border-gray-300"
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                    <Label htmlFor="moreBug" className="text-sm font-medium text-gray-700">
                                      More Bugs
                                    </Label>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="isCustom"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Checkbox
                                      id="isCustom"
                                      className="h-5 w-5 text-green-500 border-gray-300"
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                    <Label htmlFor="isCustom" className="text-sm font-medium text-gray-700">
                                      Custom Package
                                    </Label>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                  </div>
                  
                  <Card>
                    <CardContent className="p-6">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 mb-2">Package Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter package description..."
                                className="min-h-[100px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSheetOpen(false)}
                  disabled={isLoading}
                  className="w-full sm:w-auto h-11"
                >
                  Cancel
                </Button>
                                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Package...
                    </>
                  ) : (
                    <>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Update Package
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPackage;

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Loader2, Plus, Package, DollarSign, FileText } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function AddOnForm({ refreshAddon }: { refreshAddon: () => void }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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
        setDialogOpen(false);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
    }
  }

  const resetForm = () => {
    form.reset();
  };

  return (
    <>
      <Button onClick={() => {
        resetForm();
        setDialogOpen(true);
      }} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
        <Plus className="mr-2 h-4 w-4" />
        Add On
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
          {/* Balanced Header Design */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 border border-green-100 mb-6">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-full -translate-y-12 translate-x-12"></div>
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="bg-white/80 border-green-200 text-green-700">
                    New Add-on
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                  Add Add-on Model
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-sm">
                  Create a new add-on with pricing and features for your packages
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
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2">Add-on Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter add-on name..." className="h-11" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                              <FormLabel className="text-sm font-medium text-gray-700 mb-2">Add-on Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter add-on description..."
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
                    onClick={() => setDialogOpen(false)}
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
                        Creating Add-on...
                      </>
                    ) : (
                      <>
                        <Package className="mr-2 h-4 w-4" />
                        Create Add-on
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

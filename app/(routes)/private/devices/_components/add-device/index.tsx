import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Monitor, Smartphone, Globe, Wifi, Settings } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const deviceSchema = z.object({
  name: z.string().min(1, "Required"),
  os: z.string().min(1, "Required"),
  version: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  network: z.string().optional(),
});

import { countries } from "@/app/_constants/countries";
import { IBrowser } from "@/app/_interface/browser";
import { addDeviceService } from "@/app/_services/device.service";
import toasterService from "@/app/_services/toaster-service";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFormattedBrowsers } from "../../_utils";
import { OPERATIING_SYSTEMS } from "../../_constants";
import { Badge } from "@/components/ui/badge";

export function AddDevice({
  browsers,
  refreshDevices,
}: {
  browsers: IBrowser[];
  refreshDevices: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const formattedBrowsers = getFormattedBrowsers(browsers);
  const [selectedBrowsers, setSelectedBrowsers] = useState<string[]>([]);
  const [isInvalidBrowsers, setIsInvalidBrowsers] = useState<boolean>(false);

  const form = useForm<z.infer<typeof deviceSchema>>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: "",
      os: "",
      version: "",
      country: "",
      city: "",
      network: "",
    },
  });

  async function onSubmit(values: z.infer<typeof deviceSchema>) {
    setIsLoading(true);
    try {
      const response = await addDeviceService({
        ...values,
        browsers: selectedBrowsers,
      });
      if (response) {
        refreshDevices();
        toasterService.success(response.message);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setDialogOpen(false);
      setIsLoading(false);
    }
  }

  const validateBrowsers = () => {
    if (!selectedBrowsers.length) {
      setIsInvalidBrowsers(true);
    }

    if (!isInvalidBrowsers && form.formState.isValid) {
      form.handleSubmit(onSubmit);
    }
  };

  const resetForm = () => {
    form.reset();
    setIsInvalidBrowsers(false);
    setSelectedBrowsers([]);
  };

  useEffect(() => {
    if (selectedBrowsers.length) {
      setIsInvalidBrowsers(false);
    }
  }, [selectedBrowsers]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => resetForm()} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" /> Add Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        {/* Balanced Header Design */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 border border-green-100 mb-6">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-white/80 border-green-200 text-green-700">
                  New Device
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                Add New Device
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-sm">
                Configure device settings and browser compatibility for comprehensive testing coverage
              </DialogDescription>
            </div>
          </div>
        </div>
        
        <div className="px-6 pb-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method="post" className="space-y-8">
              {/* Device Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Monitor className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Device Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Device Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter device name" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="os"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Operating System</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select OS" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              {OPERATIING_SYSTEMS.map((os: string) => (
                                <SelectItem key={os} value={os}>
                                  {os}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Browser Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Globe className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Browser Compatibility</h3>
                </div>
                <div className="space-y-3">
                  <Label className={`text-sm font-medium ${isInvalidBrowsers ? "text-destructive" : "text-gray-700"}`}>
                    Supported Browsers
                  </Label>
                  <MultiSelect
                    options={formattedBrowsers}
                    onValueChange={setSelectedBrowsers}
                    defaultValue={selectedBrowsers}
                    placeholder="Select browsers for testing"
                    variant="secondary"
                    animation={2}
                    maxCount={3}
                    className="min-h-11"
                  />
                  {isInvalidBrowsers ? (
                    <FormMessage>
                      Please select at least one browser
                    </FormMessage>
                  ) : null}
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Version</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1.0.0" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="network"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Network</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., WiFi, 4G" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-80">
                            {countries.map((country) => (
                              <SelectItem
                                key={country._id}
                                value={country.description}
                              >
                                {country.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 px-6 pb-6">
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={isLoading}
            className="w-full sm:w-auto h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={() => validateBrowsers()}
            disabled={isLoading}
            className="w-full sm:w-auto h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Device...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Device
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

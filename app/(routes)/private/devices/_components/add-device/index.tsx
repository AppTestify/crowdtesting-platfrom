import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

export function AddDevice({
  browsers,
  refreshDevices,
}: {
  browsers: IBrowser[];
  refreshDevices: () => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
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
      setSheetOpen(false);
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
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button onClick={() => resetForm()}>
          <Plus /> Add device
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full !max-w-full md:w-[550px] md:!max-w-[550px]">
        <SheetHeader>
          <SheetTitle className="text-left">Add new device</SheetTitle>
          <SheetDescription className="text-left">
            Expand your device inventory! The more devices you add, the greater
            your chances of receiving project recommendations.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method="post">
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Operating system</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-[250px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {OPERATIING_SYSTEMS.map((severity: string) => (
                              <SelectItem value={severity}>
                                {severity}
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

              <div className="my-2">
                <Label className={isInvalidBrowsers ? "text-destructive" : ""}>
                  Browsers
                </Label>
                <MultiSelect
                  options={formattedBrowsers}
                  onValueChange={setSelectedBrowsers}
                  defaultValue={selectedBrowsers}
                  placeholder=""
                  variant="secondary"
                  animation={2}
                  maxCount={3}
                  className="mt-2"
                />
                {isInvalidBrowsers ? (
                  <FormMessage className="mt-2">
                    Please select at least one browser
                  </FormMessage>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verison</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Network</FormLabel>
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
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-8 w-full flex justify-end gap-2">
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
                  onClick={() => validateBrowsers()}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}

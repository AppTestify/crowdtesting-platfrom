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

import { Plus } from "lucide-react";

const  EditPricing=({
    sheetOpen,
    setSheetOpen,
    refreshUsers,
  }: {
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshUsers: () => void;

})=>{

  const form = useForm({
    defaultValues: {
      pricingtype: "",
      pricingName: "",
      tester: "",
      duration: "",
      bugs: "",
      amount: "",
      currency: "",
      moreBugs: false,
      iscustom: false,
      isActive: false,
      description: "",
    },
  });


  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
   
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Pricing</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="pricingtype"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pricing Type</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricingName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pricing Name</FormLabel>
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
                name="tester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tester</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
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
                name="bugs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bugs</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3">
              <div>
                <Checkbox /> More Bugs
              </div>
              <div>
                <Checkbox /> Custom
              </div>
              <div>
                <Checkbox /> Active
              </div>
            </div>

            <div className="">
              <Label htmlFor="discription">Description</Label>
              <Textarea
                placeholder="Type your message here."
                name="description"
              />
            </div>

            <SheetClose asChild>
              <div className="flex gap-5">
                <Button type="button" className="w-full md:w-fit">
                  Cancel
                </Button>

                <Button type="submit" className="w-full md:w-fit">
                  Update
                </Button>
              </div>
            </SheetClose>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default EditPricing;

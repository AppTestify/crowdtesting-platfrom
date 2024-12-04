import { ITestCaseResult } from '@/app/_interface/test-case-result';
import toasterService from '@/app/_services/toaster-service';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/text-area';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const testCaseResultSchema = z.object({
    actualResult: z.string().min(1, "Required"),
    projectId: z.string().optional(),
    remarks: z.string().min(1, 'Required')
});

export default function Moderate({
    sheetOpen,
    setSheetOpen,
    testCaseResult
}: {
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    testCaseResult: ITestCaseResult | null;
}) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof testCaseResultSchema>>({
        resolver: zodResolver(testCaseResultSchema),
        defaultValues: {
            actualResult: "",
            remarks: ""
        }
    });

    async function onSubmit(values: z.infer<typeof testCaseResultSchema>) {
        setIsLoading(true);
        try {
            // const response = await updateTestCycleService(projectId as string, testCycleId, {
            //     ...values,
            // });
            // if (response) {
            //     refreshTestCycle();
            //     toasterService.success(response.message);
            // }
        } catch (error) {
            toasterService.error();
        } finally {
            setSheetOpen(false);
            setIsLoading(false);
        }
    }

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-left">Moderate Test Case</SheetTitle>
                    <SheetDescription className="text-left">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae laboriosam quas
                        cum expedita quidem sit qui quaerat, ipsa animi nobis
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            <div className="grid grid-cols-1 gap-2">
                                <FormField
                                    control={form.control}
                                    name="actualResult"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Actual result</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className="h-10 min-h-[3rem] resize-y"
                                                    {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-2 mt-3">
                                <FormField
                                    control={form.control}
                                    name="remarks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Remarks</FormLabel>
                                            <FormControl>
                                                <Textarea  {...field} />
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
                                    className="w-full md:w-fit"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {isLoading ? "Updating" : "Update"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    )
}

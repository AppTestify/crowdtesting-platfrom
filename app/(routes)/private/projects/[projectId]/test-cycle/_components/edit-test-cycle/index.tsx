import React, { useEffect, useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import toasterService from "@/app/_services/toaster-service";
import { updateTestPlanService } from "@/app/_services/test-plan.service";
import { Textarea } from "@/components/ui/text-area";
import { ITestCycle } from "@/app/_interface/test-cycle";
import { updateTestCycleService } from "@/app/_services/test-cycle.service";
import { formatDateReverse, formatSimpleDate } from "@/app/_constants/date-formatter";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

const testCycleSchema = z.object({
    title: z.string().min(1, "Required"),
    projectId: z.string().optional(),
    description: z.string().min(1, 'Required'),
    startDate: z.date(),
    endDate: z.date(),
});

export function EditTestCycle({
    testCycle,
    sheetOpen,
    setSheetOpen,
    refreshTestCycle,
}: {
    testCycle: ITestCycle;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshTestCycle: () => void;
}) {
    const testCycleId = testCycle.id;
    const { title, projectId, description, startDate, endDate } = testCycle;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof testCycleSchema>>({
        resolver: zodResolver(testCycleSchema),
        defaultValues: {
            title: title || "",
            projectId: projectId,
            description: description || "",
            startDate: parseDate(startDate || new Date()),
            endDate: parseDate(endDate || new Date()),
        },
    });

    async function onSubmit(values: z.infer<typeof testCycleSchema>) {
        setIsLoading(true);
        try {
            const response = await updateTestCycleService(projectId as string, testCycleId, {
                ...values,
            });
            if (response) {
                refreshTestCycle();
                toasterService.success(response.message);
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

    useEffect(() => {
        if (sheetOpen) {
            resetForm();
        }
    }, [sheetOpen]);

    const formatDate = (date: Date) => {
        return formatSimpleDate(date);
    };

    function parseDate(date: string | Date | undefined): Date {
        return date ? new Date(date) : new Date();
    }

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-left">Edit test cycle</SheetTitle>
                    <SheetDescription className="text-left">
                        A series of iterative testing phases, including planning, execution,
                        and closure, to validate product functionality.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            <div className="grid grid-cols-1 gap-2">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Test cycle title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-3">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-[260px] pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field?.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Select date</span>
                                                            )}

                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={(date) => field.onChange(date)}
                                                        disabled={(date) => date < new Date("1900-01-01") ||
                                                            date > form.watch('endDate')
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>End date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-[260px] pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field?.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Select date</span>
                                                            )}

                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={(date) => field.onChange(date)}
                                                        disabled={(date) =>
                                                            date < form.watch("startDate") ||
                                                            date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-2 mt-3">
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} />
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
    );
}

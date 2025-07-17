import React, { useEffect, useState } from "react";
import { CalendarIcon, Loader2, Save, Play, Calendar, FileText, Settings, Clock, AlertTriangle, Edit3, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { addTestCycleAttachmentsService } from "@/app/_services/test-cycle-attachment.service";
import TestCycleAttachments from "../attachments/test-cycle-attachment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const testCycleSchema = z.object({
    title: z.string().min(1, "Required"),
    projectId: z.string().optional(),
    description: z.string().min(1, 'Required'),
    startDate: z.date(),
    endDate: z.date(),
});

interface EditTestCycleProps {
    testCycle: ITestCycle;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshTestCycle: () => void;
}

export function EditTestCycle({ testCycle, sheetOpen, setSheetOpen, refreshTestCycle }: EditTestCycleProps) {
    const testCycleId = testCycle.id;
    const { title, projectId, description, startDate, endDate } = testCycle;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [attachments, setAttachments] = useState<any>();

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
                await uploadAttachment();
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

    const uploadAttachment = async () => {
        setIsLoading(true);
        try {
            await addTestCycleAttachmentsService(projectId as string, testCycleId, {
                attachments,
            });
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        form.reset();
    };

    useEffect(() => {
        if (sheetOpen) {
            resetForm();
            setAttachments([]);
        }
    }, [sheetOpen]);

    const formatDate = (date: Date) => {
        return formatSimpleDate(date);
    };

    function parseDate(date: string | Date | undefined): Date {
        return date ? new Date(date) : new Date();
    }

    return (
        <div className="w-full">
            {/* Balanced Header Design */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border border-blue-100 mb-6">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="relative flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Edit3 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 font-mono">
                                #{testCycle?.customId}
                            </Badge>
                            <Badge variant="outline" className="bg-white/80 border-blue-200 text-blue-700">
                                Edit Mode
                            </Badge>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Edit Test Cycle
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Update test cycle information, timeline, and supporting documents
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                        {/* Basic Information Card */}
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
                                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <Target className="h-5 w-5 text-white" />
                                    </div>
                                    Basic Information
                                </CardTitle>
                                <p className="text-gray-600 mt-2">
                                    Update essential details about the test cycle
                                </p>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-blue-500" />
                                                Test Cycle Title *
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    placeholder="Enter a descriptive title for the test cycle"
                                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-12 text-base rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-purple-500" />
                                                Description *
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    {...field} 
                                                    placeholder="Describe the test cycle objectives and scope"
                                                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[120px] text-base rounded-xl resize-none"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Timeline Card */}
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-purple-100">
                                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-white" />
                                    </div>
                                    Timeline
                                </CardTitle>
                                <p className="text-gray-600 mt-2">
                                    Update start and end dates for the test cycle
                                </p>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                                                    <Calendar className="h-4 w-4 text-green-500" />
                                                    Start Date *
                                                </FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-4 text-left font-normal border-gray-200 focus:border-green-500 focus:ring-green-500 h-12 text-base rounded-xl",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field?.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Select start date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 z-50 rounded-xl shadow-2xl" align="start">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={(date) => field.onChange(date)}
                                                            disabled={(date) => date < new Date("1900-01-01") ||
                                                                date > form.watch('endDate')
                                                            }
                                                            initialFocus
                                                            className="rounded-xl"
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
                                                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                                                    <Calendar className="h-4 w-4 text-red-500" />
                                                    End Date *
                                                </FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-4 text-left font-normal border-gray-200 focus:border-red-500 focus:ring-red-500 h-12 text-base rounded-xl",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field?.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Select end date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 z-50 rounded-xl shadow-2xl" align="start">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={(date) => field.onChange(date)}
                                                            disabled={(date) =>
                                                                date < form.watch("startDate") ||
                                                                date < new Date("1900-01-01")
                                                            }
                                                            initialFocus
                                                            className="rounded-xl"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                
                                {/* Duration Display */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-blue-900">Duration</p>
                                            <p className="text-lg font-bold text-blue-700">
                                                {form.watch("startDate") && form.watch("endDate") ? 
                                                    `${Math.ceil((form.watch("endDate").getTime() - form.watch("startDate").getTime()) / (1000 * 60 * 60 * 24))} days` : 
                                                    "Select both dates to see duration"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attachments Card */}
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-100">
                                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                    Attachments
                                </CardTitle>
                                <p className="text-gray-600 mt-2">
                                    Manage test cycle attachments and supporting files
                                </p>
                            </CardHeader>
                            <CardContent className="p-6">
                                <TestCycleAttachments
                                    testCycleId={testCycleId}
                                    isUpdate={true}
                                    isView={false}
                                    setAttachmentsData={setAttachments}
                                />
                            </CardContent>
                        </Card>

                        {/* Validation Summary */}
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl overflow-hidden border border-amber-200">
                            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-amber-200">
                                <CardTitle className="text-lg font-bold text-amber-900 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                                        <AlertTriangle className="h-4 w-4 text-white" />
                                    </div>
                                    Form Validation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50">
                                        <div className={`w-3 h-3 rounded-full ${form.watch("title") ? "bg-green-500" : "bg-red-500"}`}></div>
                                        <span className={`text-sm font-medium ${form.watch("title") ? "text-green-700" : "text-red-700"}`}>
                                            Title: {form.watch("title") ? "✓ Valid" : "✗ Required"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50">
                                        <div className={`w-3 h-3 rounded-full ${form.watch("description") ? "bg-green-500" : "bg-red-500"}`}></div>
                                        <span className={`text-sm font-medium ${form.watch("description") ? "text-green-700" : "text-red-700"}`}>
                                            Description: {form.watch("description") ? "✓ Valid" : "✗ Required"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50">
                                        <div className={`w-3 h-3 rounded-full ${form.watch("startDate") ? "bg-green-500" : "bg-red-500"}`}></div>
                                        <span className={`text-sm font-medium ${form.watch("startDate") ? "text-green-700" : "text-red-700"}`}>
                                            Start Date: {form.watch("startDate") ? "✓ Valid" : "✗ Required"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50">
                                        <div className={`w-3 h-3 rounded-full ${form.watch("endDate") ? "bg-green-500" : "bg-red-500"}`}></div>
                                        <span className={`text-sm font-medium ${form.watch("endDate") ? "text-green-700" : "text-red-700"}`}>
                                            End Date: {form.watch("endDate") ? "✓ Valid" : "✗ Required"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row gap-3 pt-6 pb-4 px-6 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSheetOpen(false)}
                                disabled={isLoading}
                                className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || !form.formState.isValid}
                                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update Test Cycle
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}

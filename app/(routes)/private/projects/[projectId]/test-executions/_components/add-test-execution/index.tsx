"use client";

import { Button } from "@/components/ui/button";
import {
    CalendarIcon,
    Loader2,
    Plus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toasterService from "@/app/_services/toaster-service";
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ITestCycle } from "@/app/_interface/test-cycle";
import { getTestCycleListService } from "@/app/_services/test-cycle.service";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TEST_EXECUTION_TYPE_LIST } from "@/app/_constants/test-case";
import { addTestExecution } from "@/app/_services/test-execution.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, FileText, Calendar, Layers, Tag } from "lucide-react";

const testExecutionSchema = z.object({
    projectId: z.string().min(1, 'Required'),
    testCycle: z.string().min(1, 'Required'),
    type: z.string().optional(),
    startDate: z.date().nullable(),
    endDate: z.date().nullable(),
});

export function AddTestExecution({ refreshTestExecution }: { refreshTestExecution: () => void }) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [testCycles, setTestCycles] = useState<ITestCycle[]>([]);
    const { projectId } = useParams<{ projectId: string }>();
    const [isTestCycleLoading, setIsTestCycleLoading] = useState<boolean>(false);
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);

    const form = useForm<z.infer<typeof testExecutionSchema>>({
        resolver: zodResolver(testExecutionSchema),
        defaultValues: {
            projectId: projectId,
            testCycle: "",
            type: "",
            startDate: null,
            endDate: null,
        },
    });

    const columns: ColumnDef<{ id: string | undefined; testCaseId: string | undefined; title: string; }>[] = [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => <div>{row.getValue("id")}</div>,
        },
        {
            accessorKey: "testCaseId",
            header: "Test Case ID",
            cell: ({ row }) => (
                <div>
                    {row.getValue("testCaseId")}
                </div>
            ),
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => <div>{row.getValue("title")}</div>,
        },
    ];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>({
            id: false,
            data: false,
            contentType: false,
            name: true,
        });
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState<any>([]);

    const flattenedData = useMemo(() => {
        const selectedTestCycleId = form.watch("testCycle");

        return testCycles?.flatMap((cycle) =>
            cycle.testCases?.filter(() =>
                cycle?._id === selectedTestCycleId
            ).map((testCase) => ({
                id: cycle._id,
                testCaseId: testCase?.customId,
                title: testCase?.title,
            })) || []
        ) || [];
    }, [testCycles, form.watch("testCycle")]);

    const table = useReactTable({
        data: flattenedData || [],
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        globalFilterFn: "includesString",
        state: {
            sorting,
            globalFilter,
            columnVisibility,
            rowSelection,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    async function onSubmit(values: z.infer<typeof testExecutionSchema>) {
        setIsLoading(true);
        try {
            const response = await addTestExecution(projectId, {
                ...values,
                startDate: values.startDate ? values.startDate.toISOString() : null,
                endDate: values.endDate ? values.endDate.toISOString() : null,
                projectId: projectId ?? "",
            });
            if (response) {
                refreshTestExecution();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
            setSheetOpen(false);
        }
    }

    const testCycleList = async () => {
        setIsTestCycleLoading(true);
        try {
            const response = await getTestCycleListService(projectId);
            if (JSON.stringify(response) !== JSON.stringify(testCycles)) {
                setTestCycles(response);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsTestCycleLoading(false);
        }
    };

    const validateTestCycle = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
        }
    };

    const resetForm = () => {
        form.reset();
        setStartDateOpen(false);
        setEndDateOpen(false);
    };

    useEffect(() => {
        if (sheetOpen) {
            testCycleList();
            // Reset date picker states when dialog opens
            setStartDateOpen(false);
            setEndDateOpen(false);
        }
    }, [sheetOpen]);

    return (
        <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => resetForm()} className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" /> Add Test Execution
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Play className="h-5 w-5 text-green-600" />
                        </div>
                        Add New Test Execution
                    </DialogTitle>
                    <div className="text-gray-600 text-sm">
                        Create a new test execution by selecting a test cycle, type, and timeline.
                    </div>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Test Cycle & Type Card */}
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Layers className="h-5 w-5 text-blue-600" />
                                        Test Cycle & Type
                                    </CardTitle>
                                    <CardDescription>
                                        Select the test cycle and execution type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="testCycle"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-sm font-medium text-gray-700">Test Cycle *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="w-full border-gray-300 focus:border-blue-500">
                                                        <SelectValue placeholder="Select test cycle..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {isTestCycleLoading ? (
                                                                <div className="p-3 text-center text-gray-500">Loading</div>
                                                            ) : testCycles.length > 0 ? (
                                                                testCycles.map((testCycle) => (
                                                                    <SelectItem
                                                                        key={testCycle._id}
                                                                        value={testCycle._id as string}
                                                                        disabled={!testCycle?.testCases || testCycle?.testCases?.length === 0}
                                                                    >
                                                                        {!testCycle?.testCases || testCycle?.testCases?.length === 0 ?
                                                                            testCycle.title + " (0 test cases)" :
                                                                            testCycle.title
                                                                        }
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <div className="p-1 text-center text-gray-500">
                                                                    Test cycle not found
                                                                </div>
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-sm font-medium text-gray-700">Type</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="w-full border-gray-300 focus:border-blue-500">
                                                        <SelectValue placeholder="Select type..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {TEST_EXECUTION_TYPE_LIST.map((type) => (
                                                                <SelectItem key={type} value={type}>
                                                                    {type}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Timeline Card */}
                            <Card className="border-l-4 border-l-purple-500">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-purple-600" />
                                        Timeline
                                    </CardTitle>
                                    <CardDescription>
                                        Set the start and end date for this execution
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-sm font-medium text-gray-700">Start Date</FormLabel>
                                                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal border-gray-300 focus:border-blue-500",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Select start date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={field.value || undefined}
                                                            onSelect={(date) => {
                                                                field.onChange(date);
                                                                setStartDateOpen(false);
                                                            }}
                                                            disabled={(date) => date < new Date("1900-01-01")}
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
                                                <FormLabel className="text-sm font-medium text-gray-700">End Date</FormLabel>
                                                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal border-gray-300 focus:border-blue-500",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Select end date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={field.value || undefined}
                                                            onSelect={(date) => {
                                                                field.onChange(date);
                                                                setEndDateOpen(false);
                                                            }}
                                                            disabled={(date) =>
                                                                date < (form.watch("startDate") ?? new Date("1900-01-01")) ||
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
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <Button
                                    disabled={isLoading}
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setSheetOpen(false)}
                                    className="px-6"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={isLoading}
                                    type="submit"
                                    size="lg"
                                    className="px-6 bg-green-600 hover:bg-green-700"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {isLoading ? "Creating..." : "Create Test Execution"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

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
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ITestCycle } from "@/app/_interface/test-cycle";
import { getTestCycleListService } from "@/app/_services/test-cycle.service";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TEST_EXECUTION_TYPE_LIST } from "@/app/_constants/test-case";
import { addTestExecution } from "@/app/_services/test-execution.service";

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
    };

    useEffect(() => {
        if (sheetOpen) {
            testCycleList();
        }
    }, [sheetOpen]);

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button onClick={() => resetForm()}>
                    <Plus /> Add test execution
                </Button>
            </SheetTrigger>
            <SheetContent
                className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto"
            >
                <SheetHeader>
                    <SheetTitle className="text-left">Add new test execution</SheetTitle>
                </SheetHeader>

                <div className="mt-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">

                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <FormField
                                    control={form.control}
                                    name="testCycle"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Test cycle</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
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
                                                                    {testCycle.title}
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
                                            <FormLabel>Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {TEST_EXECUTION_TYPE_LIST.map((type) => (
                                                            <SelectItem value={type} key={type}>
                                                                <div className="flex items-center">
                                                                    {type}
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

                            </div>
                            {form.watch("testCycle") &&
                                <div className="mt-3 rounded-md border">
                                    <Table className="">
                                        <TableHeader className="">
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <TableRow key={headerGroup.id} className=" ">
                                                    {headerGroup.headers.map((header) => (
                                                        <TableHead key={header.id} className=" ">
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody>
                                            {table && table.getRowModel() && table?.getRowModel()?.rows?.length ? (
                                                table.getRowModel().rows.map((row) => (
                                                    <TableRow
                                                        key={row.id}
                                                        className=""
                                                        data-state={row.getIsSelected() && "selected"}
                                                    >
                                                        {row.getVisibleCells().map((cell) => (
                                                            <TableCell key={cell.id} className=" ">
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={columns.length}
                                                        className="h-24 text-center border-t border-gray-300"
                                                    >
                                                        {!isLoading ? "No results" : "Loading"}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            }

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
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Start date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value || undefined}
                                                        onSelect={field.onChange}
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
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>End date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value || undefined}
                                                        onSelect={field.onChange}
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
                            </div>



                            < div className="mt-6 w-full flex justify-end gap-2" >
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
                                    onClick={() => validateTestCycle()}
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
        </Sheet >
    );
}

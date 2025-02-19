"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    CalendarIcon,
    Loader2,
    Plus,
    Trash,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";
import { Textarea } from "@/components/ui/text-area";
import { addTestCycleService } from "@/app/_services/test-cycle.service";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";
import { ITestCycleAttachment } from "@/app/_interface/test-cycle";
import { DocumentName } from "@/app/_components/document-name";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/app/_constants/countries";
import { Checkbox } from "@/components/ui/checkbox";

const testCycleSchema = z.object({
    title: z.string().min(1, "Required"),
    projectId: z.string().optional(),
    description: z.string().min(1, 'Required'),
    attachments: z.array(z.instanceof(File)).optional(),
    startDate: z.date(),
    endDate: z.date(),
    country: z.string().optional(),
    isEmailSend: z.boolean().optional()
})
    .refine((data) => {
        if (data.isEmailSend === true && !data.country) {
            return false;
        }
        return true;
    }, {
        message: "Required",
        path: ["country"]
    });

export function AddTestCycle({ refreshTestCycle }: { refreshTestCycle: () => void }) {
    const columns: ColumnDef<ITestCycleAttachment[]>[] = [
        {
            accessorKey: "name",
            cell: ({ row }) => (
                <div>
                    <DocumentName document={row.getValue("name")} />
                </div>
            ),
        },
    ];

    const [sheetOpen, setSheetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();
    const [attachments, setAttachments] = useState<File[]>([]);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<z.infer<typeof testCycleSchema>>({
        resolver: zodResolver(testCycleSchema),
        defaultValues: {
            title: "",
            projectId: projectId,
            startDate: new Date(),
            endDate: new Date(),
            country: "",
            isEmailSend: false
        },
    });

    async function onSubmit(values: z.infer<typeof testCycleSchema>) {
        setIsLoading(true);
        try {
            const response = await addTestCycleService(projectId, {
                ...values,
                country: values.country || "",
                isEmailSend: values.isEmailSend === true,
            });
            if (response) {
                refreshTestCycle();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
            setSheetOpen(false);
        }
    }

    const validateTestCycle = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
        }
    };

    const resetForm = () => {
        form.reset();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);

            setAttachments((prevAttachments = []) => {
                const uniqueAttachments = newFiles.filter(
                    (file) =>
                        !prevAttachments.some(
                            (prevFile) => prevFile.name === file.name && prevFile.size === file.size
                        )
                );

                const updatedAttachments = [...prevAttachments, ...uniqueAttachments];
                form.setValue("attachments", updatedAttachments);

                return updatedAttachments;
            });

        }
    };

    const handleRemoveFile = (index: number) => {
        setAttachments((prevAttachments) => {
            const updatedAttachments = prevAttachments?.filter((_, i) => i !== index);
            form.setValue("attachments", updatedAttachments);
            return updatedAttachments;
        });

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    useEffect(() => {
        if (sheetOpen) {
            setAttachments([]);
        }
    }, [sheetOpen])

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button onClick={() => resetForm()}>
                    <Plus /> Add test cycle
                </Button>
            </SheetTrigger>
            <SheetContent
                className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto"
            >
                <SheetHeader>
                    <SheetTitle className="text-left">Add new test cycle</SheetTitle>
                    <SheetDescription className="text-left">
                        A series of iterative testing phases, including planning, execution, and closure,
                        to validate product functionality.
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
                                                                "w-full pl-3 text-left font-normal",
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
                                                        selected={field.value}
                                                        onSelect={field.onChange}
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
                                                                "w-full pl-3 text-left font-normal",
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
                                                        selected={field.value}
                                                        onSelect={field.onChange}
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
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="h-72">
                                                    <SelectGroup>
                                                        {countries.map((country) => (
                                                            <SelectItem value={country?.description}>
                                                                <div className="flex items-center">
                                                                    {country?.description}
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

                            <div className="grid grid-cols-1 gap-2 ">
                                <div className="w-full mt-3">
                                    <Label htmlFor="attachments">Attachments</Label>
                                    <Input
                                        className="mt-2 opacity-0 cursor-pointer absolute w-0 h-0"
                                        id="attachments"
                                        type="file"
                                        multiple
                                        ref={inputRef}
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="attachments"
                                        className="flex mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer"
                                    >
                                        Choose Files
                                    </label>
                                    {attachments?.length > 0 && (
                                        <div className="mt-2">
                                            New attachments
                                            <div className="mt-4 rounded-md border">
                                                <Table>
                                                    <TableBody>
                                                        {attachments?.length ? (
                                                            attachments.map((attachment, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>
                                                                        <DocumentName document={attachment} />
                                                                    </TableCell>
                                                                    <TableCell className="flex justify-end items-end mr-6">
                                                                        <Button
                                                                            type="button"
                                                                            onClick={() => handleRemoveFile(index)}
                                                                            variant="ghost"
                                                                            size="icon"
                                                                        >
                                                                            <Trash className="h-4 w-4 text-destructive" />
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell
                                                                    colSpan={columns.length}
                                                                    className="h-24 text-center"
                                                                >
                                                                    No attachments found
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mt-3">
                                <FormField
                                    control={form.control}
                                    name="isEmailSend"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <Checkbox
                                                        id="terms"
                                                        className="h-5 w-5 text-blue-500 border-gray-300 "
                                                        checked={Boolean(field.value)}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label htmlFor="terms" className="text-gray-600">Send mail to all testers of same country to apply?</Label>
                                                </div>
                                            </FormControl>
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

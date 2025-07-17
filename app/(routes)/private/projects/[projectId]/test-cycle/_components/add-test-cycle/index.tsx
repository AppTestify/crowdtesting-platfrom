"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    CalendarIcon,
    Loader2,
    Plus,
    Trash,
    TriangleAlert,
    Play,
    Calendar,
    FileText,
    Globe,
    Mail,
    Settings
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";
import { Textarea } from "@/components/ui/text-area";
import { addTestCycleService, getTestCycleEmailFormatService } from "@/app/_services/test-cycle.service";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";
import { ITestCycleAttachment } from "@/app/_interface/test-cycle";
import { DocumentName } from "@/app/_components/document-name";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/app/_constants/countries";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TextEditor from "../../../../_components/text-editor";

const testCycleSchema = z.object({
    title: z.string().min(1, "Required"),
    projectId: z.string().optional(),
    description: z.string().min(1, 'Required'),
    attachments: z.array(z.instanceof(File)).optional(),
    startDate: z.date(),
    endDate: z.date(),
    country: z.string().optional(),
    isEmailSend: z.boolean().optional()
}).refine((data) => {
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

    const requiredVariables = ["{fullName}", "{name}", "{startDate}", "{endDate}", "{description}", "{country}", "{applyLink}"];
    const EmailSchema = z.object({
        subject: z.string().min(1, "Required"),
        body: z.string().min(1, "Required").superRefine((body, ctx) => {
            const missingVars = requiredVariables.filter(variable => !body.includes(variable));
            if (missingVars.length > 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Missing required variables: ${missingVars.join(", ")}`,
                });
            }
        })
    });

    const [emailFormat, setEmailFormat] = useState<{ subject: string, body: string }>();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();
    const [attachments, setAttachments] = useState<File[]>([]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<z.infer<typeof testCycleSchema>>({
        resolver: zodResolver(testCycleSchema),
        mode: "onChange",
        defaultValues: {
            title: "",
            projectId: projectId,
            startDate: new Date(),
            endDate: new Date(),
            country: "",
            isEmailSend: false
        },
    });

    const Emailform = useForm<z.infer<typeof EmailSchema>>({
        resolver: zodResolver(EmailSchema),
        mode: "onChange",
        defaultValues: {
            subject: emailFormat?.subject || "",
            body: emailFormat?.body || "",
        },
    });

    async function onFormSubmit(emailValues: z.infer<typeof EmailSchema>,
        testCycleValues: z.infer<typeof testCycleSchema>) {
        setIsModalLoading(true);
        try {
            const combinedData = {
                ...testCycleValues,
                country: testCycleValues.country || "",
                isEmailSend: testCycleValues.isEmailSend === true,
                emailFormat: emailValues.body,
                emailSubject: emailValues.subject,
            }
            const response = await addTestCycleService(projectId, combinedData);
            if (response) {
                setModalOpen(false);
                toasterService.success(response.message);
                refreshTestCycle();
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsModalLoading(false);
            setDialogOpen(false);
        }
    }

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
            setDialogOpen(false);
        }
    }

    const validateTestCycle = async (event?: React.FormEvent) => {
        event?.preventDefault();
        await form.trigger();

        if (form.formState.isValid) {
            if (form.watch("isEmailSend")) {
                await getEmailFormat();
                setModalOpen(true);
                return;
            } else {
                form.handleSubmit(onSubmit)();
            }
        }
    };

    const validateEmail = async () => {
        const isEmailValid = await Emailform.trigger();
        if (!isEmailValid) return;

        Emailform.handleSubmit((emailValues) => {
            form.handleSubmit((testCycleValues) => {
                onFormSubmit(emailValues, testCycleValues);
            })();
        })();
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

    const getEmailFormat = async () => {
        try {
            const response = await getTestCycleEmailFormatService(projectId);
            if (response) {
                setEmailFormat({
                    ...response,
                    body: decodeURIComponent(response.body),
                });
            }
        } catch (error) {
            toasterService.error();
        }
    }

    useEffect(() => {
        if (emailFormat) {
            Emailform.reset({
                subject: emailFormat.subject || "",
                body: emailFormat.body || ""
            })
        }
    }, [emailFormat]);

    useEffect(() => {
        if (dialogOpen) {
            setAttachments([]);
            setModalOpen(false);
        }
    }, [dialogOpen])

    return (
        <>
            <Button onClick={() => {
                resetForm();
                setDialogOpen(true);
            }} className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Test Cycle
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="space-y-6">
                        {/* Enhanced Header with Gradient Background */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 border border-green-100">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="relative flex items-start gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Play className="h-8 w-8 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="outline" className="bg-white/80 border-green-200 text-green-700">
                                            New Test Cycle
                                        </Badge>
                                    </div>
                                    <DialogTitle className="text-2xl font-bold text-gray-900 mb-3">
                                        Add New Test Cycle
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-600">
                                        Create a new testing phase with planning, execution, and closure phases to validate product functionality.
                                    </DialogDescription>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="mt-8 space-y-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                                {/* Basic Information Card */}
                                <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                            Basic Information
                                        </CardTitle>
                                        <p className="text-sm text-gray-600">
                                            Essential details about the test cycle
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                        Test Cycle Title *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            {...field} 
                                                            placeholder="Enter a descriptive title for the test cycle"
                                                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
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
                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                        Description *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea 
                                                            {...field} 
                                                            placeholder="Describe the test cycle objectives and scope"
                                                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Timeline Card */}
                                <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-purple-600" />
                                            Timeline
                                        </CardTitle>
                                        <p className="text-sm text-gray-600">
                                            Set the start and end dates for the test cycle
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="startDate"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel className="text-sm font-medium text-gray-700">Start Date *</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className={cn(
                                                                            "w-full pl-3 text-left font-normal border-gray-300 focus:border-green-500 focus:ring-green-500",
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
                                                            <PopoverContent className="w-auto p-0 z-50" align="start">
                                                                <CalendarComponent
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
                                                        <FormLabel className="text-sm font-medium text-gray-700">End Date *</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className={cn(
                                                                            "w-full pl-3 text-left font-normal border-gray-300 focus:border-green-500 focus:ring-green-500",
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
                                                            <PopoverContent className="w-auto p-0 z-50" align="start">
                                                                <CalendarComponent
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
                                    </CardContent>
                                </Card>

                                {/* Email Configuration Card */}
                                <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Mail className="h-5 w-5 text-orange-600" />
                                            Email Configuration
                                        </CardTitle>
                                        <p className="text-sm text-gray-600">
                                            Configure email notifications for testers
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="isEmailSend"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="flex items-center space-x-3">
                                                            <Checkbox
                                                                id="emailSend"
                                                                className="h-5 w-5 text-green-500 border-gray-300"
                                                                checked={Boolean(field.value)}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                            <Label htmlFor="emailSend" className="text-sm font-medium text-gray-700">
                                                                Send email to all testers from same country to apply?
                                                            </Label>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {form.watch("isEmailSend") && (
                                            <FormField
                                                control={form.control}
                                                name="country"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                            <Globe className="h-4 w-4 text-blue-500" />
                                                            Country *
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                        >
                                                            <SelectTrigger className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500">
                                                                <SelectValue placeholder="Select country for email notifications" />
                                                            </SelectTrigger>
                                                            <SelectContent className="h-72">
                                                                <SelectGroup>
                                                                    {countries.map((country) => (
                                                                        <SelectItem key={country?.description} value={country?.description}>
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
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Attachments Card */}
                                <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                            Attachments
                                        </CardTitle>
                                        <p className="text-sm text-gray-600">
                                            Add supporting files and documents
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="w-full">
                                            <Label htmlFor="attachments" className="text-sm font-medium text-gray-700">
                                                Supporting Files
                                            </Label>
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
                                                className="flex mt-2 h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors cursor-pointer hover:bg-gray-50 focus:border-green-500 focus:ring-green-500"
                                            >
                                                Choose Files
                                            </label>
                                            {attachments?.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Selected Files</p>
                                                    <div className="rounded-md border">
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
                                    </CardContent>
                                </Card>

                                <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
                                    <Button
                                        disabled={isLoading}
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        onClick={() => setDialogOpen(false)}
                                        className="w-full sm:w-auto border-gray-300 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        disabled={isLoading}
                                        type="submit"
                                        size="lg"
                                        onClick={(e) => validateTestCycle(e)}
                                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Plus className="mr-2 h-4 w-4" />
                                        )}
                                        {isLoading ? "Creating..." : "Create Test Cycle"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Email Format Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[700px]" onOpenAutoFocus={(event) => event.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-orange-600" />
                            Email Format Configuration
                        </DialogTitle>
                        <DialogDescription>
                            Configure the email template for tester notifications
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...Emailform}>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                validateEmail()
                            }}
                            className="flex flex-col max-h-[70vh] overflow-y-auto p-2">
                            <div className="grid grid-cols-1 gap-2 mt-2 mx-2">
                                <FormField
                                    control={Emailform.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">Email Subject *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    autoFocus={false}
                                                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-2 mt-4 mx-2">
                                <FormField
                                    control={Emailform.control}
                                    name="body"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex justify-between">
                                                <div className="text-sm font-medium text-gray-700">Email Body *</div>
                                                <span className="text-xs flex text-destructive">
                                                    <span className="mr-1">
                                                        <TriangleAlert className="h-4 w-4" />
                                                    </span>
                                                    <span>
                                                        Please do not remove any variables
                                                    </span>
                                                </span>
                                            </FormLabel>
                                            <FormControl>
                                                <TextEditor
                                                    markup={field.value || ""}
                                                    onChange={(value) => {
                                                        Emailform.setValue("body", value, { shouldDirty: true });
                                                        Emailform.trigger("body");
                                                    }} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="mt-6 w-full flex justify-end gap-2" >
                                <Button
                                    disabled={isModalLoading}
                                    type="button"
                                    variant={"outline"}
                                    size="lg"
                                    className="w-full md:w-fit border-gray-300 hover:bg-gray-50"
                                    onClick={() => setModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={isModalLoading}
                                    type="submit"
                                    size="lg"
                                    onClick={() => validateEmail()}
                                    className="w-full md:w-fit bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {isModalLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Mail className="mr-2 h-4 w-4" />
                                    )}
                                    {isModalLoading ? "Sending..." : "Send Email"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}

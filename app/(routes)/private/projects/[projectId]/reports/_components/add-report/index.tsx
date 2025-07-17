"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Loader2,
    Plus,
    Trash,
    FileText,
    Upload,
    Save,
    Target,
    Info,
} from "lucide-react";
import { useEffect, useState } from "react";

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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";
import TextEditor from "../../../../_components/text-editor";
import { addReportService } from "@/app/_services/report.service";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { DocumentName } from "@/app/_components/document-name";
import { ColumnDef } from "@tanstack/react-table";
import { IReportAttachmentDisplay } from "@/app/_interface/report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ReportSchema = z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, 'Required'),
    attachments: z
        .array(z.instanceof(File))
        .optional(),
});

export function AddReport({ refreshReports }: { refreshReports: () => void }) {
    const columns: ColumnDef<IReportAttachmentDisplay[]>[] = [
        {
            accessorKey: "name",
            cell: ({ row }) =>
                <div>
                    <DocumentName document={row.getValue("name")} />
                </div>,
        }
    ];

    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const { projectId } = useParams<{ projectId: string }>();

    const form = useForm<z.infer<typeof ReportSchema>>({
        resolver: zodResolver(ReportSchema),
        defaultValues: {
            title: "",
            description: "",
            attachments: []
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).map((file) => ({
                ...file,
                name: file.name,
                contentType: file.type,
                size: file.size,
                getValue: (key: string) => (key === "contentType" ? file.type : undefined),
            }));
            const fileArray = Array.from(e.target.files);
            setAttachments(files);
            form.setValue("attachments", fileArray);
        }
    };

    const handleRemoveFile = (index: number) => {
        setAttachments((prevAttachments) => prevAttachments?.filter((_, i) => i !== index));
        form.setValue("attachments", attachments?.filter((_, i) => i !== index));
    };

    async function onSubmit(values: z.infer<typeof ReportSchema>) {
        setIsLoading(true);
        try {
            const response = await addReportService(projectId, {
                ...values
            });
            if (response) {
                refreshReports();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
            setDialogOpen(false);
        }
    }

    const validateReport = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
        }
    };

    const resetForm = () => {
        form.reset();
    };

    useEffect(() => {
        if (!dialogOpen) {
            setAttachments([]);
            form.setValue("attachments", []);
        }
    }, [dialogOpen]);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => resetForm()} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Report
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                {/* Balanced Header Design */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 border border-green-100 mb-6">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-full -translate-y-12 translate-x-12"></div>
                    <div className="relative flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Plus className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="bg-white/80 border-green-200 text-green-700">
                                    Create Mode
                                </Badge>
                            </div>
                            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                                Add New Report
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 text-sm">
                                Create a new report with detailed information and supporting documents
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <div className="px-6 space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            {/* Basic Information Card */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Target className="h-5 w-5 text-blue-600" />
                                        Basic Information
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Enter the report title and description
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-blue-500" />
                                                    Report Title *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field} 
                                                        placeholder="Enter a descriptive title for the report"
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
                                                    <Info className="h-4 w-4 text-purple-500" />
                                                    Description *
                                                </FormLabel>
                                                <FormControl>
                                                    <TextEditor
                                                        markup={field.value || ""}
                                                        onChange={(value) => {
                                                            form.setValue("description", value);
                                                            form.trigger("description");
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Attachments Card */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Upload className="h-5 w-5 text-green-600" />
                                        Attachments
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Upload supporting files and documents
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="w-full">
                                            <Label htmlFor="attachments" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <Upload className="h-4 w-4 text-green-500" />
                                                Choose Files
                                            </Label>
                                            <Input
                                                className="mt-2 opacity-0 cursor-pointer absolute w-0 h-0"
                                                id="attachments"
                                                type="file"
                                                multiple
                                                onChange={handleFileChange}
                                            />
                                            <label
                                                htmlFor="attachments"
                                                className="flex mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-colors cursor-pointer hover:border-green-500 hover:bg-green-50 items-center gap-2"
                                            >
                                                <Upload className="h-4 w-4 text-green-500" />
                                                <span className="text-gray-700">Choose Files</span>
                                            </label>
                                        </div>

                                        {attachments?.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                        {attachments.length} file(s) selected
                                                    </Badge>
                                                </div>
                                                <div className="rounded-xl border border-gray-200 bg-white">
                                                    <Table>
                                                        <TableBody>
                                                            {attachments?.length ? (
                                                                attachments.map((attachment, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell>
                                                                            <DocumentName document={attachment} />
                                                                        </TableCell>
                                                                        <TableCell className="flex justify-end items-center">
                                                                            <Button 
                                                                                type="button" 
                                                                                onClick={() => handleRemoveFile(index)}
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8"
                                                                            >
                                                                                <Trash className="h-4 w-4 text-red-500" />
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            ) : (
                                                                <TableRow>
                                                                    <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
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

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 pb-4 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                    disabled={isLoading}
                                    className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !form.formState.isValid}
                                    onClick={() => validateReport()}
                                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Report
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

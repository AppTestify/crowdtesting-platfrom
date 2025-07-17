import React, { useEffect, useState } from "react";
import { Loader2, Save, FileText, Info, Settings, Upload, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { IReport } from "@/app/_interface/report";
import { updateReportService } from "@/app/_services/report.service";
import TextEditor from "../../../../_components/text-editor";
import { addReportAttachmentsService } from "@/app/_services/report-attachment.service";
import ReportAttachments from "../attachments/report-attachment";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REPORT_STATUS_LIST } from "@/app/_constants/issue";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ReportSchema = z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, 'Required'),
    status: z.string().optional(),
});

export function EditReport({
    report,
    dialogOpen,
    setDialogOpen,
    refreshReports,
    projectAdmin
}: {
    report: IReport;
    dialogOpen: boolean;
    setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshReports: () => void;
    projectAdmin: boolean
}) {
    const ReportId = report._id;
    const { projectId } = useParams<{ projectId: string }>();
    const { title, description, status } = report;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [attachments, setAttachments] = useState<any>();
    const [userData, setUserData] = useState<any>();
    const { data } = useSession();

    const form = useForm<z.infer<typeof ReportSchema>>({
        resolver: zodResolver(ReportSchema),
        defaultValues: {
            title: title || "",
            description: description || "",
            status: status || ""
        },
    });

    async function onSubmit(values: z.infer<typeof ReportSchema>) {
        setIsLoading(true);
        try {
            const response = await updateReportService(projectId as unknown as string, ReportId, {
                ...values,
            });
            if (response) {
                await uploadAttachment();
                refreshReports();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setDialogOpen(false);
            setIsLoading(false);
        }
    }

    const uploadAttachment = async () => {
        setIsLoading(true);
        try {
            await addReportAttachmentsService(projectId as unknown as string, ReportId, { attachments });
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
        if (dialogOpen) {
            resetForm();
        }
    }, [dialogOpen]);

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                {/* Balanced Header Design */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-50 to-red-50 p-6 border border-orange-100 mb-6">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-100/50 to-red-100/50 rounded-full -translate-y-12 translate-x-12"></div>
                    <div className="relative flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Settings className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="bg-white/80 border-orange-200 text-orange-700">
                                    Edit Mode
                                </Badge>
                            </div>
                            <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                                Edit Report
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 text-sm">
                                Update report information and configuration
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
                                        Update report title and description
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

                            {/* Status Card (Admin Only) */}
                            {(projectAdmin === true || userData?.role === UserRoles.ADMIN) && (
                                <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Settings className="h-5 w-5 text-orange-600" />
                                            Status Management
                                        </CardTitle>
                                        <p className="text-sm text-gray-600">
                                            Update report status (Admin only)
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Settings className="h-4 w-4 text-orange-500" />
                                                        Status
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger className="w-full border-gray-200 focus:border-orange-500 focus:ring-orange-500 h-12 text-base rounded-xl">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                {REPORT_STATUS_LIST.map((status) => (
                                                                    <SelectItem key={status} value={status}>
                                                                        {status}
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
                            )}

                            {/* Attachments Card */}
                            <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Upload className="h-5 w-5 text-green-600" />
                                        Attachments
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Manage report attachments and supporting files
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <ReportAttachments 
                                        reportId={ReportId} 
                                        isUpdate={true} 
                                        isView={false}
                                        setAttachmentsData={setAttachments} 
                                    />
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
                                            Update Report
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

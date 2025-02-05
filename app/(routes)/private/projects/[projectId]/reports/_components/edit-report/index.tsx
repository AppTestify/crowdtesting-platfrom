import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { IReport } from "@/app/_interface/report";
import { updateReportService } from "@/app/_services/report.service";
import TextEditor from "../../../../_components/text-editor";
import { addReportAttachmentsService } from "@/app/_services/report-attachment.service";
import ReportAttachments from "../attachments/report-attachment";

const ReportSchema = z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, 'Required')
});

export function EditReport({
    report,
    sheetOpen,
    setSheetOpen,
    refreshReports,
}: {
    report: IReport;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshReports: () => void;
}) {
    const ReportId = report._id;
    const { title, projectId, description } = report;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [attachments, setAttachments] = useState<any>();

    const form = useForm<z.infer<typeof ReportSchema>>({
        resolver: zodResolver(ReportSchema),
        defaultValues: {
            title: title || "",
            description: description || ""
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
            setSheetOpen(false);
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
        if (sheetOpen) {
            resetForm();
        }
    }, [sheetOpen]);

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-left">Edit report</SheetTitle>
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
                                            <FormLabel>report title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
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
                                                {/* <Textarea {...field} /> */}
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
                            </div>
                            <ReportAttachments reportId={ReportId} isUpdate={true} isView={false}
                                setAttachmentsData={setAttachments} />

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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import toasterService from "@/app/_services/toaster-service";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { IIssue, IIssuePayload } from "@/app/_interface/issue";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { priorityDropdown, severityDropdown, statusDropdown } from "@/app/_constants/issue-dropdown";
import { updateIssueService } from "@/app/_services/issue.service";
import { Textarea } from "@/components/ui/text-area";

const issueSchema = z.object({
    title: z.string().min(1, "Required"),
    severity: z.string().min(1, "Required"),
    priority: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    status: z.string().optional(),
    projectId: z.string().optional()
});

const EditIssue = ({
    issue,
    sheetOpen,
    setSheetOpen,
    refreshIssues,
}: {
    issue: IIssue;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshIssues: () => void;
}) => {
    const issueId = issue?._id;
    const { title, severity, priority, description, status, projectId } = issue;
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof issueSchema>>({
        resolver: zodResolver(issueSchema),
        defaultValues: {
            title: title || "",
            severity: severity || "",
            priority: priority || "",
            description: description || "",
            status: status || "",
            projectId: projectId || ""
        },
    });

    async function onSubmit(values: z.infer<typeof issueSchema>) {
        setIsLoading(true);
        try {
            const response = await updateIssueService(issueId, {
                ...values,
            });
            if (response) {
                refreshIssues();
                toasterService.success(response?.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setSheetOpen(false);
            setIsLoading(false);
        }
    }

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px]">
                <SheetHeader>
                    <SheetTitle className="text-left">Edit Issue</SheetTitle>
                    <SheetDescription className="text-left">
                        Our project is experiencing some issues affecting functionality and user experience,
                        which need to be addressed to ensure smooth performance.
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
                                            <FormLabel>Issue title</FormLabel>
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
                                    name="severity"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Severity</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-[250px]">
                                                    <SelectValue placeholder="Select a severity" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Severity</SelectLabel>
                                                        {severityDropdown.map((severity) => (
                                                            <SelectItem value={severity.name}>{severity?.name}</SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Priority</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-[250px]">
                                                    <SelectValue placeholder="Select a severity" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Severity</SelectLabel>
                                                        {priorityDropdown.map((priority) => (
                                                            <SelectItem value={priority.name}>{priority?.name}</SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-2 mt-4">
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <FormControl>
                                                    <Textarea {...field} className="h-[140px]" placeholder="Type issue description" />
                                                </FormControl>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-3">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-[250px]">
                                                    <SelectValue placeholder="Select a severity" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Status</SelectLabel>
                                                        {statusDropdown.map((status) => (
                                                            <SelectItem value={status.name}>{status?.name}</SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="mt-6 w-full flex justify-end gap-2">
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
};

export default EditIssue;

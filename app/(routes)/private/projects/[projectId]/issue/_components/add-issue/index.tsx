"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Delete, DeleteIcon, Download, Loader2, Paperclip, Plus } from "lucide-react";
import { useRef, useState } from "react";

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
import { addIssueService } from "@/app/_services/issue.service";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { priorityDropdown, severityDropdown } from "@/app/_constants/issue-dropdown";
import { Textarea } from "@/components/ui/text-area";
import { useParams } from 'next/navigation';
import { addIssueAttachmentService } from "@/app/_services/issue-attachment.service";

const projectSchema = z.object({
    title: z.string().min(1, "Required"),
    severity: z.string().min(1, "Required"),
    priority: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    status: z.string().optional(),
    projectId: z.string().optional()
});

const fileSchema = z.object({
    attachment: z.instanceof(File)
});

export function AddIssue({ refreshIssues }: { refreshIssues: () => void; }) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const { projectId } = useParams<{ projectId: string }>();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof projectSchema>>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: "",
            severity: "",
            priority: "",
            description: "",
            status: "New",
            projectId: projectId
        },
    });

    async function onSubmit(values: z.infer<typeof projectSchema>) {
        setIsLoading(true);

        try {
            const response = await addIssueService({ ...values });

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

    const validateIssue = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit);
        }
    };

    const resetForm = () => {
        form.reset();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(Array.from(event.target.files));
        }
    };

    const selectFile = () => {
        fileInputRef.current?.click();
    };

    // async function onSubmitFile(selectedFiles: z.infer<typeof fileSchema>) {
    //     try {
    //         const response = await addIssueAttachmentService({ selectedFiles });

    //         if (response) {
    //             refreshIssues();
    //             toasterService.success(response?.message);
    //         }
    //     } catch (error) {
    //         toasterService.error();
    //     } finally {
    //         // setIsLoading(false);
    //     }
    // }

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button onClick={() => resetForm()}>
                    <Plus /> Add Issue
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px]">
                <SheetHeader>
                    <SheetTitle className="text-left">Add new issue</SheetTitle>
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
                                                <Textarea {...field} className="h-[150px]" placeholder="Type issue description" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-2 mt-4">
                                <div className="w-28 h-6 bg-gray-200 flex items-center rounded-sm cursor-pointer"
                                    onClick={selectFile}>
                                    <Paperclip className="h-4 w-4 mx-2" />
                                    <p className="text-sm">Attach New</p>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                        className="hidden"
                                    />
                                </div>
                                {selectedFiles.length > 0 && (
                                    <div className="mt-2">
                                        <ul className="list-disc pl-5">
                                            {selectedFiles.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="h-8 bg-gray-100 text-sm inline-flex items-center rounded border border-gray-300 px-2  mr-2 space-x-2"
                                                >
                                                    <span>{file.name}</span>
                                                    <Download className="w-5 h-5" />
                                                    <Delete className="w-5 h-5" />
                                                </div>
                                            ))}
                                        </ul>
                                    </div>
                                )}
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
                                    onClick={() => validateIssue()}
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

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Loader2,
    Plus,
    Trash,
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
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { Label } from "@/components/ui/label";
import { ColumnDef } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { DocumentName } from "@/app/_components/document-name";
import { addRequirementService } from "@/app/_services/requirement.service";
import { IRequirementAttachmentDisplay } from "@/app/_interface/requirement";

const projectSchema = z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    projectId: z.string().optional(),
    attachments: z
        .array(z.instanceof(File))
        .optional()
});

export function AddRequirement({ refreshRequirements }: { refreshRequirements: () => void }) {
    const columns: ColumnDef<IRequirementAttachmentDisplay[]>[] = [
        {
            accessorKey: "name",
            cell: ({ row }) =>
                <div>
                    <DocumentName document={row.getValue("name")} />
                </div>,
        }
    ];

    const [sheetOpen, setSheetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();
    const [attachments, setAttachments] = useState<File[]>([]);

    const form = useForm<z.infer<typeof projectSchema>>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: "",
            description: "",
            projectId: projectId,
            attachments: [],
        },
    });

    async function onSubmit(values: z.infer<typeof projectSchema>) {
        setIsLoading(true);
        try {
            const response = await addRequirementService(projectId, { ...values });
            if (response) {
                refreshRequirements();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
            setSheetOpen(false);
        }
    }

    const validateRequirement = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
        }
    };

    const resetForm = () => {
        form.reset();
    };

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


    useEffect(() => {
        if (!sheetOpen) {
            setAttachments([]);
            form.setValue("attachments", []);
        }
    }, [sheetOpen]);

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button onClick={() => resetForm()}>
                    <Plus /> Add requirement
                </Button>
            </SheetTrigger>
            <SheetContent
                className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto"
            >
                <SheetHeader>
                    <SheetTitle className="text-left">Add new requirement</SheetTitle>
                    <SheetDescription className="text-left">
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Accusantium magnam sequi iusto velit, deserunt, cum labore animi.
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
                                            <FormLabel>Requirement title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
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
                            <div className="grid grid-cols-1 gap-2 ">
                                <div className="w-full mt-3">
                                    <Label htmlFor="attachments">Attachments</Label>
                                    <Input
                                        className="mt-2 opacity-0 cursor-pointer absolute w-0 h-0"
                                        id="attachments"
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="attachments"
                                        className="flex mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer"
                                    >
                                        Choose Files
                                    </label>
                                    {attachments?.length > 0 &&
                                        <div className="mt-2">
                                            New attachments
                                            <div className="mt-4 rounded-md border">
                                                <Table>
                                                    <TableBody>
                                                        {attachments?.length ? (
                                                            attachments.map((attachment, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell><DocumentName document={attachment} /></TableCell>
                                                                    <TableCell className="flex justify-end items-end mr-6">
                                                                        <Button type="button" onClick={() => handleRemoveFile(index)}
                                                                            variant="ghost"
                                                                            size="icon">
                                                                            <Trash className="h-4 w-4 text-destructive" />
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                                                    No attachments found
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    }
                                </div>
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
                                    onClick={() => validateRequirement()}
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
        </Sheet>
    );
}

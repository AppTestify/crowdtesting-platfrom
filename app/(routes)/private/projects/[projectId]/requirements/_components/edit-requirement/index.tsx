import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
} from "@/components/ui/sheet";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { addIssueAttachmentsService } from "@/app/_services/issue-attachment.service";
import { useSession } from "next-auth/react";
import { updateRequirementService } from "@/app/_services/requirement.service";
import RequirementAttachments from "../attachments/requirement-attachment";
import { IRequirement } from "@/app/_interface/requirement";
import { addRequirementAttachmentsService } from "@/app/_services/requirement-attachment.service";

const requirementSchema = z.object({
    title: z.string().min(1, "Required"),
    description: z.string()
        .min(10, "The description must be at least 10 characters long.")
        .nonempty("Required"),
    projectId: z.string().optional()
});

const EditRequirement = ({
    requirement,
    sheetOpen,
    setSheetOpen,
    refreshRequirements,
}: {
    requirement: IRequirement;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshRequirements: () => void;
}) => {
    const requirementId = requirement?.id as string;
    const { projectId, title, description } = requirement;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [userData, setUserData] = useState<any>();
    const { data } = useSession();
    const form = useForm<z.infer<typeof requirementSchema>>({
        resolver: zodResolver(requirementSchema),
        defaultValues: {
            title: requirement?.title || "",
            description: requirement?.description || "",
            projectId: requirement?.projectId || "",
        },
    });


    async function onSubmit(values: z.infer<typeof requirementSchema>) {
        setIsLoading(true);
        try {
            const response = await updateRequirementService(projectId as string, requirementId, {
                ...values,
            });
            if (response) {
                refreshRequirements();
                toasterService.success(response?.message);
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
            await addRequirementAttachmentsService(projectId as string, requirementId, { attachments });
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.MouseEvent) => {
        e.preventDefault();
        const values = form.getValues();
        await onSubmit(values);
        await uploadAttachment();
    };

    useEffect(() => {
        if (sheetOpen) {
            if (data) {
                const { user } = data;
                setUserData(user);
            }
        }
    }, [sheetOpen]);

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent
                className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto"
            >
                <SheetHeader>
                    <SheetTitle className="text-left">Edit requirement</SheetTitle>
                    <SheetDescription className="text-left">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor a
                        totam blanditiis veniam laudantium dolores quidem id magni ut
                        dignissimos.
                    </SheetDescription>
                </SheetHeader>

                <div>
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
                            <RequirementAttachments requirementId={requirementId} isUpdate={true} isView={false}
                                setAttachmentsData={setAttachments} />

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
                                    onClick={handleSubmit}
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
        </Sheet >
    );
};

export default EditRequirement;

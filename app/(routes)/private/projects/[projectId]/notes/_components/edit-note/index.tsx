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
import { Textarea } from "@/components/ui/text-area";
import { INote } from "@/app/_interface/note";
import { updateNoteService } from "@/app/_services/note.service";
import TextEditor from "../../../../_components/text-editor";

const NoteSchema = z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, 'Required')
});

export function EditNote({
    Note,
    sheetOpen,
    setSheetOpen,
    refreshNotes,
}: {
    Note: INote;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshNotes: () => void;
}) {
    const NoteId = Note._id;
    const { title, projectId, description } = Note;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof NoteSchema>>({
        resolver: zodResolver(NoteSchema),
        defaultValues: {
            title: title || "",
            description: description || ""
        },
    });

    async function onSubmit(values: z.infer<typeof NoteSchema>) {
        setIsLoading(true);
        try {
            const response = await updateNoteService(projectId as string, NoteId, {
                ...values,
            });
            if (response) {
                refreshNotes();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setSheetOpen(false);
            setIsLoading(false);
        }
    }

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
                    <SheetTitle className="text-left">Edit note</SheetTitle>
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
                                            <FormLabel>note title</FormLabel>
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

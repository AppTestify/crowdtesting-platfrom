"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Loader2,
    Plus,
} from "lucide-react";
import { useState } from "react";

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
import TextEditor from "../../../../_components/text-editor";
import { addNoteService } from "@/app/_services/note.service";

const NoteSchema = z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, 'Required')
});

export function AddNote({ refreshNotes }: { refreshNotes: () => void }) {

    const [sheetOpen, setSheetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();

    const form = useForm<z.infer<typeof NoteSchema>>({
        resolver: zodResolver(NoteSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    });

    async function onSubmit(values: z.infer<typeof NoteSchema>) {
        setIsLoading(true);
        try {
            const response = await addNoteService(projectId, {
                ...values,
            });
            if (response) {
                refreshNotes();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
            setSheetOpen(false);
        }
    }

    const validateNote = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
        }
    };

    const resetForm = () => {
        form.reset();
    };


    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button onClick={() => resetForm()}>
                    <Plus /> Add note
                </Button>
            </SheetTrigger>
            <SheetContent
                className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto"
            >
                <SheetHeader>
                    <SheetTitle className="text-left">Add new note</SheetTitle>
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
                                            <FormLabel>Note title</FormLabel>
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
                                    onClick={() => validateNote()}
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

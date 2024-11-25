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
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useParams } from "next/navigation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TESTING_LIST } from "@/app/_constants/test-plan";
import TextEditor from "../../../../_components/text-editor";
import { addTestPlanService } from "@/app/_services/test-plan.service";

const testPlanSchema = z.object({
    title: z.string().min(1, "Required"),
    projectId: z.string().optional(),
    parameters: z.array(z.object({
        parameter: z.string().min(1, 'Required'),
        description: z.string().min(1, 'Required')
    })),
});

export function AddTestPlan({ refreshTestPlans }: { refreshTestPlans: () => void }) {

    const [sheetOpen, setSheetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();

    const form = useForm<z.infer<typeof testPlanSchema>>({
        resolver: zodResolver(testPlanSchema),
        defaultValues: {
            title: "",
            projectId: projectId,
            parameters: [],
        },
    });

    async function onSubmit(values: z.infer<typeof testPlanSchema>) {
        setIsLoading(true);
        try {
            const response = await addTestPlanService(projectId, {
                ...values,
            });
            if (response) {
                refreshTestPlans();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
            setSheetOpen(false);
        }
    }

    const validateTestPlan = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
        }
    };

    const resetForm = () => {
        form.reset();
    };

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "parameters",
    });

    if (fields.length === 0) {
        append({ parameter: "", description: "" });
    }

    const isFieldIncomplete = (index: number) => {
        const description = form.getValues(`parameters.${index}.description`);
        const parameter = form.getValues(`parameters.${index}.parameter`);
        return !(parameter && description);
    };

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button onClick={() => resetForm()}>
                    <Plus /> Add test plan
                </Button>
            </SheetTrigger>
            <SheetContent
                className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto"
            >
                <SheetHeader>
                    <SheetTitle className="text-left">Add new test plan</SheetTitle>
                    <SheetDescription className="text-left">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis,
                        ut deleniti excepturi, quo nemo! Quisquam, saepe quo.
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
                                            <FormLabel>Test plan title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex flex-col gap-4 mt-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex flex-col w-full border border-1 rounded-md">
                                        <div className="flex flex-col w-full p-4">
                                            <FormField
                                                control={form.control}
                                                name={`parameters.${index}.parameter`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>Parameter</FormLabel>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                form.setValue(`parameters.${index}.parameter`, value);
                                                                form.trigger(`parameters.${index}.parameter`);
                                                            }}
                                                            value={field.value}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    {TESTING_LIST.map((testing) => (
                                                                        <SelectItem key={testing} value={testing}>
                                                                            <div className="flex items-center">
                                                                                <span className="mr-1">{testing}</span>
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
                                        </div>

                                        <div className="flex flex-col w-full p-4">
                                            <FormField
                                                control={form.control}
                                                name={`parameters.${index}.description`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>Description</FormLabel>
                                                        <FormControl>
                                                            <TextEditor
                                                                markup={field.value || ""}
                                                                onChange={(value) => {
                                                                    form.setValue(`parameters.${index}.description`, value);
                                                                    form.trigger(`parameters.${index}.description`);
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="px-4 py-2 flex items-center">
                                            {index === fields.length - 1 && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="mr-4"
                                                    onClick={() => append({ parameter: "", description: "" })}
                                                    disabled={isFieldIncomplete(index)}
                                                >
                                                    <Plus /> New parameter
                                                </Button>
                                            )}
                                            {index > 0 && (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => remove(index)}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
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
                                    onClick={() => validateTestPlan()}
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

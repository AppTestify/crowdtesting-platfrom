import React, { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MultiSelect } from "@/components/ui/multi-select";
import toasterService from "@/app/_services/toaster-service";
import { ITestSuite } from "@/app/_interface/test-suite";
import TextEditor from "../../../../_components/text-editor";
import { getRequirementsWithoutPaginationService } from "@/app/_services/requirement.service";
import { IRequirement } from "@/app/_interface/requirement";
import { updateTestSuiteService } from "@/app/_services/test-suite.service";
import { useParams } from "next/navigation";

const deviceSchema = z.object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    projectId: z.string().optional()
});

export function EditTestSuite({
    testSuite,
    sheetOpen,
    setSheetOpen,
    refreshTestSuites,
}: {
    testSuite: ITestSuite;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshTestSuites: () => void;
}) {
    const testSuiteId = testSuite.id;
    const [selectedRequirements, setSelectedRequirements] = useState<string[]>(
        testSuite?.requirements?.map((requirement) => requirement._id) as string[]
    );
    const { title, description } = testSuite;
    const { projectId } = useParams<{ projectId: string }>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRequirementLoading, setIsRequirementLoading] = useState<boolean>(false);
    const [requirments, setRequirements] = useState<IRequirement[]>([]);
    const form = useForm<z.infer<typeof deviceSchema>>({
        resolver: zodResolver(deviceSchema),
        defaultValues: {
            title: title || "",
            description: description || "",
        },
    });

    async function onSubmit(values: z.infer<typeof deviceSchema>) {
        setIsLoading(true);
        try {
            const response = await updateTestSuiteService(projectId, testSuiteId, {
                ...values,
                requirements: selectedRequirements,
                projectId: projectId
            });
            if (response) {
                refreshTestSuites();
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
        form.reset({
            title: title || "",
            description: description || "",
        });
        setSelectedRequirements(testSuite?.requirements?.map((requirement) => requirement._id) as string[]);
    };

    useEffect(() => {
        if (sheetOpen) {
            getRequirements();
        }
    }, [sheetOpen]);

    const getRequirements = async () => {
        try {
            setIsRequirementLoading(true);
            const response = await getRequirementsWithoutPaginationService(projectId);
            setRequirements(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsRequirementLoading(false);
        }
    }

    useEffect(() => {
        if (sheetOpen) {
            resetForm();
        }
    }, [sheetOpen]);

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[550px] md:!max-w-[550px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-left">Edit test suite</SheetTitle>
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
                                            <FormLabel>Test suite title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="my-2">
                                <Label>
                                    Requirements
                                </Label>
                                <MultiSelect
                                    options={
                                        !isRequirementLoading
                                            ? requirments?.map((requirement) => ({
                                                label: requirement?.title,
                                                value: requirement?.id,
                                            }))
                                            : []
                                    }
                                    onValueChange={setSelectedRequirements}
                                    defaultValue={selectedRequirements}
                                    placeholder={isRequirementLoading ? "Loading" : ""}
                                    variant="secondary"
                                    animation={2}
                                    maxCount={3}
                                    className="mt-2"
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
                                    // onClick={() => validateBrowsers()}
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

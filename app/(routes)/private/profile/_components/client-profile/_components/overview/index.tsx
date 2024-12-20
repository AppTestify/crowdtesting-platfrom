import { IUserByAdmin } from "@/app/_interface/user";
import { updateAdminProfile } from "@/app/_services/admin.service";
import toasterService from "@/app/_services/toaster-service";
import { getUserService } from "@/app/_services/user.service";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
});

export default function ClientProfileOverview({ user }: { user: any }) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
        },
    });

    const setFormDefaultValues = (userData: IUserByAdmin) => {
        form.reset({
            firstName: userData?.firstName || "",
            lastName: userData?.lastName || "",
        });
    };

    const getClientByUserId = async () => {
        setFormDefaultValues(await getUserService(user?._id as string));
    };

    useEffect(() => {
        getClientByUserId();
    }, []);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const response = await updateAdminProfile({ ...values });
            if (response) {
                setIsLoading(false);
                toasterService.success(response?.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
                <div>
                    <div className="flex flex-col mb-3 gap-1">
                        <span className="text-lg">Personal information</span>
                    </div>
                    <div className="mt-4 w-full flex justify-end gap-2">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem className={"w-full"}>
                                    <FormLabel>First name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem className={"w-full"}>
                                    <FormLabel>First name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <div className="w-full flex justify-end mt-4">
                    <Button
                        disabled={isLoading || !form.formState.isValid}
                        type="submit"
                        className="w-full md:w-fit"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isLoading ? "Saving profile" : "Save profile"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

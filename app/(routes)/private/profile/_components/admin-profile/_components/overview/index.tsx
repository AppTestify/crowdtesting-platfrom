import toasterService from '@/app/_services/toaster-service'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required")
})

export default function AdminProfileOverview({ user }: { user: any }) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {

        } catch (error) {
            toasterService.error();
        }
    }

    return (
        // <div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
                <div>
                    <div className="flex flex-col mb-3 gap-1">
                        <span className="text-lg">Personal information</span>
                        <span className="text-gray-500 text-xs">
                            Your personal information helps us tailor projects and resources
                            to better suit your background and expertise.
                        </span>
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
                        // disabled={isLoading || !form.formState.isValid}
                        type="submit"
                        className="w-full md:w-fit"
                    >
                        {/* {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isLoading ? "Saving profile" : "Save profile"} */}
                        Save profile
                    </Button>
                </div>
            </form>
        </Form>
        // </div>
    )
}

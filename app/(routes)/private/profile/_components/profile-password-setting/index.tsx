import { HttpStatusCode } from '@/app/_constants/http-status-code';
import toasterService from '@/app/_services/toaster-service';
import { updatePasswordService } from '@/app/_services/user.service';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod'

const formSchema = z.object({
    password: z.string().min(1, "Required"),
    confirmedPassword: z.string().min(1, "Required"),
    oldPassword: z.string().min(1, "Required")
}).refine((data) => data.password === data.confirmedPassword, {
    message: "Password doesnot matched",
    path: ['confirmedPassword']
});

const PasswordField = ({ label, name, control }: { label: string; name: string; control: any }) => {
    const [isVisible, setIsVisible] = useState<boolean>(false);

    return (
        <div className='w-full  '>
            <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                    <div className="relative w-full">
                        <Controller
                            name={name}
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <Input
                                        {...field}
                                        type={isVisible ? 'text' : 'password'}
                                        className='w-full '
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsVisible(!isVisible)}
                                        className="absolute right-3 top-2 transform  z-10"
                                    >
                                        {isVisible ? (
                                            <EyeOffIcon className="h-5 w-5 text-gray-500" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5 text-gray-500" />
                                        )}
                                    </button>

                                    {fieldState?.error && (
                                        <div className="  text-red-500 text-xs mt-1">
                                            <FormMessage>{fieldState?.error.message}</FormMessage>
                                        </div>
                                    )}
                                </>
                            )}
                        />
                    </div>
                </FormControl>
            </FormItem>
        </div>
    );
};

export default function PasswordSetting() {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmedPassword: "",
            oldPassword: ""
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const response = await updatePasswordService({ ...values });
            if (response) {
                if (response?.status === HttpStatusCode.BAD_REQUEST) {
                    toasterService.error(response?.message);
                    resetForm();
                    return;
                }
                toasterService.success(response?.message);
                resetForm();
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    const resetForm = () => {
        form.reset();
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                    <div>
                        Change Password
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
                        <PasswordField label="Old Password" name="oldPassword" control={form.control} />
                        <PasswordField label="New Password" name="password" control={form.control} />
                        <PasswordField label="Confirm Password" name="confirmedPassword" control={form.control} />
                    </div>

                    <div className="mt-10 w-full flex justify-end gap-2">
                        <Button
                            disabled={isLoading}
                            type="submit"
                            size="lg"
                            className="w-full md:w-fit"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {isLoading ? "Updating Password" : "Update Password"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

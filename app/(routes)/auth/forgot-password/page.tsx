"use client";

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import toasterService from "@/app/_services/toaster-service";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { forgotPasswordService } from "@/app/_services/auth-service";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { BrandLogo } from "@/app/_components/brand-logo";

const forgotPasswordSchema = z.object({
    email: z.string().min(1, "Required").email('Invalid email address'),
});

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema)
    });

    async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
        setIsLoading(true);
        try {
            const response = await forgotPasswordService({ ...values });
            if (response) {
                if (response.status === HttpStatusCode.BAD_REQUEST) {
                    toasterService.error(response?.message);
                    return;
                }
                toasterService.success(response?.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
            form.reset({ email: "" });
        }
    }

    const validateUser = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit);
        }
    };


    return (
        <div className="flex flex-col p-10 h-full">
            <BrandLogo className="text-white" />
            <div className="flex items-center justify-center h-4/5 mt-8 md:mt-16 xl:mt-0">
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                        <div className="mx-auto grid w-[350px] gap-6">
                            <div className="grid gap-2 text-center">
                                <h1 className="text-3xl font-bold">Forgot password</h1>
                                <p className="text-balance text-muted-foreground">
                                    Enter your email below to restore password
                                </p>
                            </div>
                            <div className="grid gap-4">
                                <div className="grid gap-2 mt-2">
                                    <Label htmlFor="email">Email</Label>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        id="email"
                                                        type="email"
                                                        placeholder="name@example.com"
                                                        required
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit"
                                    onClick={() => validateUser()}
                                    className="w-full mt-3">
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {isLoading ? "Sending" : "Send"}
                                </Button>
                            </div>
                            <div className="flex justify-center mt-2">
                                <Link href={'/auth/sign-in'}>
                                    <div>
                                        <span className="mr-0">Remember password?</span>
                                        <Link href={'/auth/sign-in'}>
                                            <span className="text-primary ml-2">Sign in!</span>
                                        </Link>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </form>
                </FormProvider>
            </div>

        </div>
    )
}
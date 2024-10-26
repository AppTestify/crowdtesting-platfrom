"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button";
import { Mail, TriangleAlert } from "lucide-react";

export default function ActivateAccountAlert() {

    return (
        <main>
            <Alert>
                <div className="flex gap-4 flex-col md:flex-row md:items-center justify-between">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <TriangleAlert className="h-4 w-4 hidden md:flex" />
                        <AlertDescription>
                            Your account is currently inactive. Please click on the link sent on your email to activate your account.
                        </AlertDescription>
                    </div>
                    <Button size={'sm'}><Mail />  Resend email</Button>
                </div>
            </Alert>
        </main>
    )
}
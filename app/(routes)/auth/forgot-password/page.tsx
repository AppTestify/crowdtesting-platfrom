import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function ForgotPassword() {

    return (
        <div className="flex flex-col p-10 h-full">
            <div className="flex justify-end">
                <Link href={'/auth/sign-in'}>
                    <Button variant="ghost">Login</Button>
                </Link>
            </div>
            <div className="flex items-center justify-center h-4/5">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Forgot password</h1>
                        <p className="text-balance text-muted-foreground">
                            Enter your email below to restore passoword
                        </p>
                    </div>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Submit
                        </Button>
                    </div>
                    <div className="text-muted-foreground text-center">
                        By clicking continue, you agree to our <a href="#" className="underline cursor-pointer">Terms of Service</a> and <a href="#" className="underline cursor-pointer">Privacy Policy</a>.
                    </div>
                </div>
            </div>
        </div>
    )
}

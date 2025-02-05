"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useMail } from "../use-mail"
import { type Mail } from "../data"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MailList } from "./mail-list"
import { MailDisplay } from "./mail-display"
import toasterService from "@/app/_services/toaster-service"
import { getMailService } from "@/app/_services/mail.service"
import { IMail } from "@/app/_interface/mail"

interface MailProps {
    accounts: {
        label: string
        email: string
        icon: React.ReactNode
    }[]
    navCollapsedSize: number
}

export function Mail({
    accounts,
    navCollapsedSize,
}: MailProps) {
    const [mails, setMails] = React.useState<IMail[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [text, setText] = React.useState<string>("");

    const displayMails = async () => {
        setIsLoading(true);
        try {
            const response = await getMailService(text);
            setMails(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    const refreshMails = () => {
        displayMails();
    }

    React.useEffect(() => {
        const debounceFetch = setTimeout(() => {
            displayMails();
        }, 500);
        return () => clearTimeout(debounceFetch);
    }, [text]);



    return (
        <TooltipProvider delayDuration={0}>
            <div className="h-full max-h-[800px] flex flex-col md:flex-row items-stretch">
                {/* MailList (Appears First on Mobile) */}
                <div className="flex flex-col w-full md:w-[40%]">
                    <Tabs defaultValue="all">
                        <div className="flex items-center px-4 py-2">
                            <h1 className="text-xl font-bold">Email</h1>
                        </div>
                        <Separator />
                        <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                            <form>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input onChange={(e) => setText(e.target.value)} placeholder="Search" className="pl-8" />
                                </div>
                            </form>
                        </div>
                        <TabsContent value="all" className="m-0">
                            <MailList items={mails} isLoading={isLoading} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* MailDisplay (Moves Below on Mobile) */}
                <div className="w-full md:w-[60%]">
                    <MailDisplay refreshMails={refreshMails} mails={mails} />
                </div>
            </div>
        </TooltipProvider>

    )
}
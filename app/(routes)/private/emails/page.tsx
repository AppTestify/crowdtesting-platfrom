"use client";

import React, { useEffect, useState } from 'react';
import { Search, Mail, Send, Inbox, Archive, Trash2, User, Calendar, Activity, MailOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getMailService } from '@/app/_services/mail.service';
import { IMail } from '@/app/_interface/mail';
import toasterService from '@/app/_services/toaster-service';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MailCompose } from '@/app/_components/mail/_components/mail-compose';

export default function EmailsPage() {
    const [mails, setMails] = useState<IMail[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>("");
    const [selectedMail, setSelectedMail] = useState<IMail | null>(null);
    const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);

    const displayMails = async () => {
        setIsLoading(true);
        try {
            const response = await getMailService(searchText);
            setMails(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    const refreshMails = () => {
        displayMails();
        setIsComposeOpen(false);
    }

    useEffect(() => {
        const debounceFetch = setTimeout(() => {
            displayMails();
        }, 500);
        return () => clearTimeout(debounceFetch);
    }, [searchText]);

    useEffect(() => {
        localStorage.setItem("selecetdMailId", "");
    }, []);

    // Calculate statistics
    const totalEmails = mails.length;
    const recentEmails = mails.filter(mail => {
        if (!mail.createdAt) return false;
        const created = new Date(mail.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return created > sevenDaysAgo;
    }).length;

    const todayEmails = mails.filter(mail => {
        if (!mail.createdAt) return false;
        const created = new Date(mail.createdAt);
        const today = new Date();
        return created.toDateString() === today.toDateString();
    }).length;

    const uniqueSenders = new Set(mails.map(mail => mail.userId?.email)).size;

    return (
        <div className="w-full max-w-full overflow-hidden">
            <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
                            Email Management
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manage and send emails to users and team members
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button
                            onClick={() => setIsComposeOpen(true)}
                            className="gap-2"
                        >
                            <Send className="h-4 w-4" />
                            Compose Email
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total Emails</CardTitle>
                            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{totalEmails}</div>
                            <p className="text-xs text-muted-foreground">All email conversations</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Today</CardTitle>
                            <Activity className="h-4 w-4 text-green-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-green-600">{todayEmails}</div>
                            <p className="text-xs text-muted-foreground">Emails today</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">This Week</CardTitle>
                            <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-blue-600">{recentEmails}</div>
                            <p className="text-xs text-muted-foreground">Last 7 days</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Unique Senders</CardTitle>
                            <User className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-purple-600">{uniqueSenders}</div>
                            <p className="text-xs text-muted-foreground">Different users</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Email Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Email List */}
                    <div className="lg:col-span-5">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Inbox</CardTitle>
                                    <Badge variant="secondary" className="text-xs">
                                        {totalEmails} emails
                                    </Badge>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search emails..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        className="pl-9 h-10"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[600px]">
                                    {isLoading ? (
                                        <div className="flex flex-col gap-3 p-4">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="flex items-start space-x-3">
                                                    <Skeleton className="h-10 w-10 rounded-full" />
                                                    <div className="space-y-2 flex-1">
                                                        <Skeleton className="h-4 w-[250px]" />
                                                        <Skeleton className="h-3 w-[200px]" />
                                                        <Skeleton className="h-3 w-[150px]" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : mails.length > 0 ? (
                                        <div className="divide-y">
                                            {mails.map((mail) => {
                                                const firstName = mail.userId?.firstName || "";
                                                const lastName = mail.userId?.lastName || "";
                                                const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
                                                const displayName = `${firstName} ${lastName}`.trim() || mail.userId?.email;

                                                return (
                                                    <div
                                                        key={mail.id}
                                                        className={cn(
                                                            "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                                                            selectedMail?.id === mail.id && "bg-muted"
                                                        )}
                                                        onClick={() => setSelectedMail(mail)}
                                                    >
                                                        <div className="flex items-start space-x-3">
                                                            <Avatar className="h-10 w-10 flex-shrink-0">
                                                                <AvatarFallback className="text-xs bg-muted">
                                                                    {initials || 'U'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-sm font-medium truncate">
                                                                        {displayName}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {formatDistanceToNow(new Date(mail.createdAt), {
                                                                            addSuffix: true,
                                                                        })}
                                                                    </p>
                                                                </div>
                                                                <p className="text-sm font-medium text-foreground truncate mt-1">
                                                                    {mail.subject}
                                                                </p>
                                                                <div
                                                                    className="text-xs text-muted-foreground line-clamp-2 mt-1"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: mail.body?.substring(0, 120) + "..." || "",
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 text-center">
                                            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                                            <p className="text-sm text-muted-foreground">No emails found</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Try adjusting your search or compose a new email
                                            </p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Email Content / Compose */}
                    <div className="lg:col-span-7">
                        <Card className="h-full">
                            {isComposeOpen ? (
                                <div className="h-full">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">Compose Email</CardTitle>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsComposeOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="h-full">
                                        <MailCompose refreshMails={refreshMails} />
                                    </CardContent>
                                </div>
                            ) : selectedMail ? (
                                <div className="h-full flex flex-col">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarFallback className="text-sm bg-muted">
                                                        {`${selectedMail.userId?.firstName?.charAt(0) || ''}${selectedMail.userId?.lastName?.charAt(0) || ''}`.toUpperCase() || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="font-semibold">
                                                        {`${selectedMail.userId?.firstName || ''} ${selectedMail.userId?.lastName || ''}`.trim() || selectedMail.userId?.email}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedMail.userId?.email}
                                                    </p>
                                                    <p className="text-lg font-medium mt-2">
                                                        {selectedMail.subject}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(selectedMail.createdAt), "PPpp")}
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <Separator />
                                    <CardContent className="flex-1 pt-6">
                                        <ScrollArea className="h-full">
                                            <div
                                                className="prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{
                                                    __html: selectedMail.body || "",
                                                }}
                                            />
                                        </ScrollArea>
                                    </CardContent>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <MailOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-lg font-medium">Select an email to read</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Choose an email from the list to view its content
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => setIsComposeOpen(true)}
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            Compose New Email
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

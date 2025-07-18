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
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Inbox className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Inbox</CardTitle>
                                            <CardDescription className="text-sm">
                                                {totalEmails} emails in your inbox
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                        {totalEmails} emails
                                    </Badge>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search emails..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        className="pl-9 h-10 border-gray-200 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[600px]">
                                    {isLoading ? (
                                        <div className="flex flex-col gap-4 p-4">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100">
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
                                        <div className="divide-y divide-gray-100">
                                            {mails.map((mail) => (
                                                <div
                                                    key={mail.id}
                                                    className={cn(
                                                        "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                                                        selectedMail?.id === mail.id && "bg-blue-50"
                                                    )}
                                                    onClick={() => setSelectedMail(mail)}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <User className="h-4 w-4 text-gray-600" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {mail.userId?.email}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {formatDistanceToNow(new Date(mail.createdAt), {
                                                                        addSuffix: true,
                                                                    })}
                                                                </p>
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-800 truncate mb-1">
                                                                {mail.subject}
                                                            </p>
                                                            <p className="text-xs text-gray-600 line-clamp-2">
                                                                {mail.body?.substring(0, 120) + "..." || ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-8 text-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <Inbox className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 mb-1">No emails found</p>
                                            <p className="text-xs text-gray-500">
                                                Try adjusting your search or compose a new email
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-4"
                                                onClick={() => setIsComposeOpen(true)}
                                            >
                                                <Send className="h-4 w-4 mr-2" />
                                                Compose New Email
                                            </Button>
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Email Content / Compose */}
                    <div className="lg:col-span-7">
                        <Card className="h-full border-0 shadow-sm">
                            {isComposeOpen ? (
                                <div className="h-full flex flex-col">
                                    <CardHeader className="pb-3 flex-shrink-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <Send className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">Compose Email</CardTitle>
                                                    <CardDescription className="text-sm">
                                                        Send a new email to your team members
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsComposeOpen(false)}
                                                className="border-gray-200 text-gray-600 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 p-0">
                                        <div className="h-full">
                                            <MailCompose refreshMails={refreshMails} />
                                        </div>
                                    </CardContent>
                                </div>
                            ) : selectedMail ? (
                                <div className="h-full flex flex-col">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4">
                                                <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                                                    <AvatarFallback className="text-sm bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700">
                                                        {`${selectedMail.userId?.firstName?.charAt(0) || ''}${selectedMail.userId?.lastName?.charAt(0) || ''}`.toUpperCase() || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900">
                                                        {`${selectedMail.userId?.firstName || ''} ${selectedMail.userId?.lastName || ''}`.trim() || selectedMail.userId?.email}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {selectedMail.userId?.email}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                                            {selectedMail.userId?.role || 'User'}
                                                        </Badge>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                            {format(new Date(selectedMail.createdAt), "PPpp")}
                                                        </div>
                                                    </div>
                                                    <p className="text-lg font-medium mt-3 text-gray-900">
                                                        {selectedMail.subject}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <Separator />
                                    <CardContent className="flex-1 pt-6">
                                        <ScrollArea className="h-full">
                                            <div
                                                className="prose prose-sm max-w-none text-gray-700"
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
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MailOpen className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="text-lg font-medium text-gray-900 mb-2">Select an email to read</p>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Choose an email from the list to view its content
                                        </p>
                                        <Button
                                            onClick={() => setIsComposeOpen(true)}
                                            className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                                        >
                                            <Send className="h-4 w-4" />
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

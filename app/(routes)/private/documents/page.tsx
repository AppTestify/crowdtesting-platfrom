"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, CheckCircle, XCircle, Clock, Users, Filter, RefreshCw } from "lucide-react";
import VerifiedDocuments from "./_components/verified";
import NonVerifiedDocument from "./_components/non-verified";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getApprovalFilesService } from "@/app/_services/file.service";
import toasterService from "@/app/_services/toaster-service";

export default function Documents() {
    const { data } = useSession();
    const router = useRouter();
    const [userData, setUserData] = useState<any>();
    const [user, setUser] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [stats, setStats] = useState({
        totalDocuments: 0,
        verifiedDocuments: 0,
        pendingDocuments: 0,
        uniqueUploaders: 0
    });

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const userParam = searchParams.get("user");
        setUser(userParam);
    }, []);

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    useEffect(() => {
        if (userData && userData?.role !== UserRoles.ADMIN) {
            router.push('/private/dashboard');
        }
    }, [userData, router]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            // Fetch both verified and non-verified documents to calculate stats
            const [verifiedResponse, nonVerifiedResponse] = await Promise.all([
                getApprovalFilesService(false, 1, 1000, ""), // Verified documents
                getApprovalFilesService(true, 1, 1000, "")   // Non-verified documents
            ]);

            const verifiedDocs = verifiedResponse?.documents || [];
            const nonVerifiedDocs = nonVerifiedResponse?.documents || [];
            const allDocs = [...verifiedDocs, ...nonVerifiedDocs];

            // Calculate unique uploaders
            const uniqueUploaders = new Set(
                allDocs.map(doc => doc.userId?.id).filter(Boolean)
            ).size;

            setStats({
                totalDocuments: allDocs.length,
                verifiedDocuments: verifiedDocs.length,
                pendingDocuments: nonVerifiedDocs.length,
                uniqueUploaders
            });
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userData?.role === UserRoles.ADMIN) {
            fetchStats();
        }
    }, [userData]);

    const refreshStats = () => {
        fetchStats();
    };

    if (userData?.role !== UserRoles.ADMIN) {
        return (
            <div className="w-full max-w-full overflow-hidden">
                <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-[300px] bg-gray-200" />
                        <Skeleton className="h-4 w-[500px] bg-gray-200" />
                        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-24 bg-gray-200" />
                            ))}
                        </div>
                        <Skeleton className="h-10 w-[400px] bg-gray-200" />
                        <Skeleton className="h-64 w-full bg-gray-200" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full overflow-hidden">
            <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
                            Document Management
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Review and approve user-submitted documents
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshStats}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total Documents</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.totalDocuments}</div>
                            <p className="text-xs text-muted-foreground">All submitted documents</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Verified</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.verifiedDocuments}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.totalDocuments > 0 ? Math.round((stats.verifiedDocuments / stats.totalDocuments) * 100) : 0}% of total
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.pendingDocuments}</div>
                            <p className="text-xs text-muted-foreground">Awaiting approval</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Contributors</CardTitle>
                            <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.uniqueUploaders}</div>
                            <p className="text-xs text-muted-foreground">Unique uploaders</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Document Management Interface */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg">Document Approval</CardTitle>
                                <CardDescription className="mt-1">
                                    Review and manage document verification status
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                    {stats.pendingDocuments} pending
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                    {stats.verifiedDocuments} verified
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Tabs defaultValue={user ? "pending" : "verified"} className="w-full">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                                <TabsList className="grid grid-cols-2 w-full sm:w-[400px]">
                                    <TabsTrigger value="verified" className="gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="hidden sm:inline">Verified Documents</span>
                                        <span className="sm:hidden">Verified</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="pending" className="gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span className="hidden sm:inline">Pending Review</span>
                                        <span className="sm:hidden">Pending</span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                            
                            <TabsContent value="verified" className="space-y-4">
                                <VerifiedDocuments />
                            </TabsContent>
                            
                            <TabsContent value="pending" className="space-y-4">
                                <NonVerifiedDocument />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

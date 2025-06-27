"use client";

import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, CreditCard, Users, RefreshCw, Plus } from "lucide-react";
import { UserRoles } from '@/app/_constants/user-roles';
import { getPaymentsByUserService } from '@/app/_services/payment.service';
import toasterService from '@/app/_services/toaster-service';
import { IPayment } from '@/app/_interface/payment';
import { PaymentCurrency } from '@/app/_constants/payment';
import PaymentTable from './_components/payment-table';
import AddPayment from '../users/_components/payment/_components/add-payment';

export default function Payments() {
    const [userData, setUserData] = useState<any>();
    const { data } = useSession();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
    const [stats, setStats] = useState({
        totalPayments: 0,
        totalAmount: 0,
        pendingPayments: 0,
        completedPayments: 0,
        currency: PaymentCurrency.USD
    });

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    const fetchStats = async () => {
        if (!userData?._id) return;
        
        setIsLoading(true);
        try {
            // Fetch payments data to calculate statistics
            const response = await getPaymentsByUserService(userData._id, 1, 1000, "");
            const payments: IPayment[] = response?.payments || [];

            // Calculate statistics
            const totalAmount = payments.reduce((sum, payment) => {
                const amount = payment.amount?.$numberDecimal || 0;
                return sum + Number(amount);
            }, 0);

            const pendingPayments = payments.filter(p => p.status === 'pending').length;
            const completedPayments = payments.filter(p => p.status === 'completed').length;

            setStats({
                totalPayments: payments.length,
                totalAmount,
                pendingPayments,
                completedPayments,
                currency: (payments[0]?.currency as PaymentCurrency) || PaymentCurrency.USD
            });
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userData?._id) {
            fetchStats();
        }
    }, [userData]);

    const refreshStats = () => {
        fetchStats();
    };

    const isAdmin = userData?.role === UserRoles.ADMIN;

    if (!userData) {
        return (
            <div className="w-full max-w-full overflow-hidden">
                <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-[250px] bg-gray-200" />
                        <Skeleton className="h-4 w-[400px] bg-gray-200" />
                        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-24 bg-gray-200" />
                            ))}
                        </div>
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
                            Payment Management
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {isAdmin ? "Manage payments and transactions across the platform" : "View your payment history and transactions"}
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
                        {isAdmin && (
                            <Button
                                onClick={() => setIsAddOpen(true)}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Payment
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total Payments</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.totalPayments}</div>
                            <p className="text-xs text-muted-foreground">All transactions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-green-600">
                                {stats.currency} {stats.totalAmount.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">Transaction volume</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Completed</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.completedPayments}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.totalPayments > 0 ? Math.round((stats.completedPayments / stats.totalPayments) * 100) : 0}% success rate
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
                            <Users className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.pendingPayments}</div>
                            <p className="text-xs text-muted-foreground">Awaiting processing</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Payment Table */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg">
                                    {isAdmin ? "All Payments" : "Your Payments"}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {isAdmin ? "Manage and track all payment transactions" : "View your payment history and transaction details"}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                    {stats.pendingPayments} pending
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                    {stats.completedPayments} completed
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <PaymentTable 
                            userId={userData._id} 
                            isAdmin={isAdmin}
                            refreshStats={refreshStats}
                        />
                    </CardContent>
                </Card>

                {/* Add Payment Dialog */}
                {isAdmin && (
                    <AddPayment 
                        userId={userData._id}
                        isOpen={isAddOpen}
                        closeDialog={() => setIsAddOpen(false)}
                        refreshPayment={refreshStats}
                        isTester={false}
                    />
                )}
            </div>
        </div>
    )
}

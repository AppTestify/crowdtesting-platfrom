"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Package as PackageIcon, Plus, RefreshCw, ShoppingCart, Users, TrendingUp, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { useRouter } from "next/navigation";
import { getPackageService } from "@/app/_services/package.service";
import { getAddonService } from "@/app/_services/addon.service";
import toasterService from "@/app/_services/toaster-service";
import { IPackage } from "@/app/_interface/package";
import { IAddon } from "@/app/_interface/addon";
import { PaymentCurrency } from "@/app/_constants/payment";
// import PackageTable from "./_components/package-table";
// import AddonTable from "./_components/addon-table";
import { AddPackage } from "./_components/add-package";
import { AddOnForm } from "./_components/add-on-form";
import PackageModel from "./_components/package-model";
import AddOnModel from "./_components/add-on";

export default function PricingPage() {
  const { data } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<any>();
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAddPackageOpen, setIsAddPackageOpen] = useState<boolean>(false);
  const [isAddAddonOpen, setIsAddAddonOpen] = useState<boolean>(false);
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalAddons: 0,
    activePackages: 0,
    activeAddons: 0,
    totalPackageValue: 0,
    totalAddonValue: 0,
    currency: PaymentCurrency.USD
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
      router.push("/private/dashboard");
    }
  }, [userData, router]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch both packages and addons data to calculate statistics
      const [packagesResponse, addonsResponse] = await Promise.all([
        getPackageService(1, 1000, ""),
        getAddonService(1, 1000, "")
      ]);

      const packages: IPackage[] = packagesResponse?.packages || [];
      const addons: IAddon[] = addonsResponse?.addon || [];

      // Calculate package statistics
      const activePackages = packages.filter(p => p.isActive).length;
      const totalPackageValue = packages.reduce((sum, pkg) => sum + (pkg.amount || 0), 0);

      // Calculate addon statistics
      const activeAddons = addons.filter(a => a.isActive).length;
      const totalAddonValue = addons.reduce((sum, addon) => sum + (addon.amount || 0), 0);

      setStats({
        totalPackages: packages.length,
        totalAddons: addons.length,
        activePackages,
        activeAddons,
        totalPackageValue,
        totalAddonValue,
        currency: packages[0]?.currency as PaymentCurrency || PaymentCurrency.USD
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
              Pricing Management
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage testing packages and add-ons for your platform
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
              <CardTitle className="text-xs sm:text-sm font-medium">Total Packages</CardTitle>
              <PackageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.totalPackages}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activePackages} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Add-ons</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalAddons}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeAddons} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Package Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {stats.currency} {stats.totalPackageValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total package worth</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Add-on Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {stats.currency} {stats.totalAddonValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total add-on worth</p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Management Interface */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Pricing Models</CardTitle>
                <CardDescription className="mt-1">
                  Configure testing packages and additional services
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {stats.totalPackages} packages
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {stats.totalAddons} add-ons
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue={user ? "addon" : "package"} className="w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <TabsList className="grid grid-cols-2 w-full sm:w-[400px]">
                  <TabsTrigger value="package" className="gap-2">
                    <PackageIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Testing Packages</span>
                    <span className="sm:hidden">Packages</span>
                  </TabsTrigger>
                  <TabsTrigger value="addon" className="gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Add-on Services</span>
                    <span className="sm:hidden">Add-ons</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="package" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Testing Packages</h3>
                      <p className="text-sm text-muted-foreground">Comprehensive testing solutions</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsAddPackageOpen(true)}
                    className="gap-2 flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    Add Package
                  </Button>
                </div>
                <PackageModel />
              </TabsContent>
              
              <TabsContent value="addon" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Add-on Services</h3>
                      <p className="text-sm text-muted-foreground">Additional testing services and features</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsAddAddonOpen(true)}
                    className="gap-2 flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    Add Service
                  </Button>
                </div>
                <AddOnModel />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Add Package Dialog */}
        {isAddPackageOpen && (
          <div>Add Package Dialog - To be implemented</div>
        )}

        {/* Add Addon Dialog */}
        {isAddAddonOpen && (
          <div>Add Addon Dialog - To be implemented</div>
        )}
      </div>
    </div>
  );
}

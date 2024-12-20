"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ActivateAccountAlert from "@/app/_components/warning-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRoles } from "@/app/_constants/user-roles";
import AdminDashboard from "./_components/admin-dashboard";
import ClientDashboard from "./_components/client-dashboard";
import TesterDashboard from "./_components/tester-dashboard";
import { formatDateWithoutTime } from "@/app/_constants/date-formatter";

export default function Dashboard() {
    const { data } = useSession();
    const [user, setUser] = useState<any | null>();
    const [currentTime, setCurrentTime] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        if (data && data?.user) {
            setUser(data.user);
        }
        setIsLoading(false);
    }, [data]);

    useEffect(() => {
        const formatDateTime = (date: Date) => {
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        };

        if (!currentTime) {
            setCurrentTime(formatDateTime(new Date()));
        }

        const now = new Date();
        const millisecondsUntilNextMinute = (60 - now.getSeconds()) * 1000;

        const timeoutId = setTimeout(() => {
            setCurrentTime(formatDateTime(new Date()));
            const intervalId = setInterval(() => {
                setCurrentTime(formatDateTime(new Date()));
            }, 60000);

            return () => clearInterval(intervalId);
        }, millisecondsUntilNextMinute);

        return () => clearTimeout(timeoutId);
    }, [currentTime]);

    if (isLoading || currentTime === null) {
        return (
            <div className="flex justify-between p-4">
                <Skeleton className="h-12 w-[200px]" />
                <div className="flex items-center">
                    <Skeleton className="h-6 w-[300px]" />
                </div>
            </div>);
    }

    if (isLoading || currentTime === null) {
        return (
            <div className="flex justify-between p-4">
                <Skeleton className="h-12 w-[250px]" />
            </div>
        );
    }

    return (
        <main className="mx-4 mt-4">
            {!isLoading && (
                <>
                    <div className="mt-3 mb-4 flex justify-between items-center space-x-4">
                        <div className="text-xl font-medium text-gray-900 px-2">
                            <span className="block">Welcome back, {user?.firstName}</span>
                            <div className="text-xs mt-1 text-gray-500 font-medium">
                                {formatDateWithoutTime(new Date().toDateString())} {currentTime}
                            </div>
                        </div>
                    </div>

                    {user && !user.isVerified ? (
                        <ActivateAccountAlert user={user} />
                    ) : null}

                    {user && user.role === UserRoles.ADMIN ? <AdminDashboard /> : null}
                    {user && user.role === UserRoles.CLIENT ? <ClientDashboard /> : null}
                    {user && user.role === UserRoles.TESTER ? <TesterDashboard /> : null}
                </>
            )}
        </main>
    );
}

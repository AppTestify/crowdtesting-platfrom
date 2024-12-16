"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ActivateAccountAlert from "@/app/_components/warning-alert";
import comingSoonImg from '../../../../public/assets/images/coming-soon.png';
import Image from "next/image";

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
        if (currentTime === null) {
            setCurrentTime(new Date().toLocaleString());
        }

        const intervalId = setInterval(() => {
            setCurrentTime(new Date().toLocaleString());
        }, 1000);

        return () => clearInterval(intervalId);
    }, [currentTime]);

    if (isLoading || currentTime === null) {
        return <div>Loading</div>;
    }

    return (
        <main className="mx-4 mt-4">
            {user && !user.isVerified ? <ActivateAccountAlert user={user} /> : null}
            <div className="mt-3 flex justify-between items-center space-x-4">
                <div className="text-xl font-medium text-gray-900 px-2">
                    <span className="block">Hello, Welcome</span>
                    <span className="font-semibold text-primary">{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="text-sm text-gray-500 font-medium px-6">
                    {currentTime}
                </div>
            </div>
            <div className=" flex items-center justify-center ">
                <Image className="object-cover w-[70%] h-auto" src={comingSoonImg} alt="coming soon" />
            </div>
        </main>
    );
}

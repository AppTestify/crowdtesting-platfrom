"use client";

import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import Payment from '../users/_components/payment';
import { UserRoles } from '@/app/_constants/user-roles';

export default function Payments() {
    const [userData, setUserData] = useState<any>();
    const { data } = useSession();

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    return (
        <main className="mx-4 mt-4">
            <div className="">
                <h2 className="font-medium text-xl text-primary">Payments</h2>
            </div>
            <div className="w-full">
                {userData &&
                    <Payment userId={userData?._id} isTester={userData?.role === UserRoles.ADMIN ? false : true} />
                }
            </div>
        </main>
    )
}

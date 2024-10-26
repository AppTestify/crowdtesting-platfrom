"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react"
import ActivateAccountAlert from "@/app/_components/warning-alert";
import { IUser } from "@/app/_interface/user";

export default function Dashboard() {
    const { data } = useSession();
    const [user, setUser] = useState<any | null>();

    useEffect(() => {
        if (data && data?.user) {
            setUser(data.user)
        }
    }, [data]);

    return (
        <main className="mx-4 mt-4">
            {!user?.isVerified ? <ActivateAccountAlert /> : null}
        </main>
    )
}
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react"
import ActivateAccountAlert from "@/app/_components/warning-alert";

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
            {user && !user.isVerified ? <ActivateAccountAlert user={user} /> : null}
        </main>
    )
}
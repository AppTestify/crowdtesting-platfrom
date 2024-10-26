"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react"
import ActivateAccountAlert from "@/app/_components/warning-alert";

export default function Dashboard() {
    // const { data } = useSession();

    // useEffect(() => {
    //     if (data) {
    //         console.log(data)
    //     }
    // }, [data]);

    return (
        <main className="mx-4 mt-4">
            
            <ActivateAccountAlert />
        </main>
    )
}
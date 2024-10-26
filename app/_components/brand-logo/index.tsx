"use client"

import { Icons } from "@/components/icons"
import * as React from "react"

export function BrandLogo({ className }: { className: string }) {
    return (
        <div className="flex items-center gap-2">
            <Icons.logo className={`h-10 w-10 ${className}`} />
            <h2 className={`font-medium text-xl ${className}`}>AppTestify</h2>
        </div>
    )
}

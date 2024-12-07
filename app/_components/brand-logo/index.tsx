"use client"

import * as React from "react"

export function BrandLogo({ className }: { className: string }) {
    return (
        <div className="flex items-center gap-2">
            <img
                src="/assets/images/logo.png"
                className={`w-40 ${className}`}
            />
        </div>
    )
}
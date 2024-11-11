"use client";

import ProjectLayouts from "@/app/_components/project-layout";

export default function ProjectLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <>
            <ProjectLayouts />
            <main className="w-full">
                {children}
            </main>
        </>
    )
}
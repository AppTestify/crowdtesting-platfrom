"use client";

import ProjectLayouts from "@/app/_components/project-layout";
import { useState } from "react";

export default function ProjectLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isProjectLayoutsLoaded, setIsProjectLayoutsLoaded] = useState<boolean>(false);

    const handleProjectLayoutsLoaded = () => {
        setIsProjectLayoutsLoaded(true);
    };

    return (
        <>
            <ProjectLayouts onLoaded={handleProjectLayoutsLoaded} />
            {isProjectLayoutsLoaded && <main className="w-full">{children}</main>}
        </>
    )
}
"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateProjectStausService } from "@/app/_services/project.service";
import toasterService from "@/app/_services/toaster-service";
import { useSession } from "next-auth/react";
import { UserRoles } from "@/app/_constants/user-roles";
import { verifyUserService } from "@/app/_services/user.service";

export function SwitchUser({
    id,
    isActive,
    projectId,
    refreshProjectUsers,
}: {
    id: string;
    isActive: boolean;
    projectId: string;
    refreshProjectUsers: () => void;
}) {
    const [status, setStatus] = useState(isActive);
    const [userData, setUserData] = useState<any>();
    const { data } = useSession();

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    useEffect(() => {
        setStatus(isActive);
    }, [isActive]);

    const toggleStatus = async () => {
        try {
            const newStatus = !status;
            setStatus(newStatus);
            const response = await verifyUserService(projectId, id, { isVerify: newStatus });
            if (response) {
                refreshProjectUsers();
            }
        } catch (error) {
            toasterService.error();
        }
    };
    return (
        <div className="flex items-center space-x-2">
            <Switch
                disabled={userData?.role !== UserRoles.ADMIN}
                id="project-mode"
                checked={status}
                onCheckedChange={toggleStatus}
            />
            <Label htmlFor="project-mode">{status ? "Verified" : "UnVerified"}</Label>
        </div>
    );
}

const UserVerify = ({
    status,
    id,
    projectId,
    refreshProjectUsers,
}: {
    status: boolean;
    id: string;
    projectId: string;
    refreshProjectUsers: () => void;
}) => {
    return (
        <div>
            <SwitchUser
                id={id}
                isActive={status}
                projectId={projectId}
                refreshProjectUsers={refreshProjectUsers}
            />
        </div>
    );
};

export default UserVerify;

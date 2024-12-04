import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import toasterService from "@/app/_services/toaster-service";
import { updateUserStausService } from "@/app/_services/user.service";

export function SwitchUser({
    isActive,
    userId,
    refreshUsers,
}: {
    isActive: boolean;
    userId: string;
    refreshUsers: () => void;
}) {
    const [status, setStatus] = useState(isActive);

    const toggleStatus = async () => {
        try {
            const newStatus = !status;
            setStatus(newStatus);
            await updateUserStausService(userId, newStatus);
        } catch (error) {
            toasterService.error();
        }
    };
    return (
        <div className="flex items-center space-x-2">
            <Switch
                id="user-mode"
                checked={status}
                onCheckedChange={toggleStatus}
            />
            <Label htmlFor="user-mode">{status ? "Active" : "In active"}</Label>
        </div>
    );
}

const UserStatus = ({
    status,
    userId,
    refreshUsers,
}: {
    status: boolean;
    userId: string;
    refreshUsers: () => void;
}) => {
    return (
        <div>
            <SwitchUser
                isActive={status}
                userId={userId}
                refreshUsers={refreshUsers}
            />
        </div>
    );
};

export default UserStatus;

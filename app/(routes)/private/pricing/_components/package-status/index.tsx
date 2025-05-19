import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import toasterService from "@/app/_services/toaster-service";
import { updatePricingStatus } from "@/app/_services/package.service";
import { HttpStatusCode } from "@/app/_constants/http-status-code";


export function SwitchPackage({
    isActive,
    packageId,
    refreshPackages,
}: {
    isActive: boolean;
    packageId: string;
    refreshPackages: () => void;
}) {
    const [status, setStatus] = useState(isActive);

    const toggleStatus = async () => {
        try {
            const newStatus = !status;
            setStatus(newStatus);
           const response= await updatePricingStatus(packageId, newStatus);

            if (response) {
                    if (response.status === HttpStatusCode.BAD_REQUEST) {
                      toasterService.error(response?.message);
                      return;
                    }
                    toasterService.success(response?.message);
                  }
        } catch (error) {
            toasterService.error();
        }
    };
    return (
        <div className="flex items-center space-x-2">
            <Switch
                // id="user-mode"
                checked={status}
                onCheckedChange={toggleStatus}
            />
            <Label htmlFor="">{status ? "Active" : "Inactive"}</Label>
        </div>
    );
}

const PackageStatus = ({
    status,
    packageId,
    refreshPackages,
}: {
    status: boolean;
    packageId: string;
    refreshPackages: () => void;
}) => {
    return (
        <div>
            <SwitchPackage
                isActive={status}
                packageId={packageId}
                refreshPackages={refreshPackages}
            />
        </div>
    );
};

export default PackageStatus;

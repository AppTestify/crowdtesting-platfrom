import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import toasterService from "@/app/_services/toaster-service";
import { updatePricingStatus } from "@/app/_services/package.service";
import { updateAddonStatus } from "@/app/_services/addon.service";
import { HttpStatusCode } from "@/app/_constants/http-status-code";

export function AddonToggle({
  isActive,
  addonId,
  refreshAddon,
}: {
  isActive: boolean;
  addonId: string;
  refreshAddon: () => void;
}) {
  const [status, setStatus] = useState(isActive);

  const toggleStatus = async () => {
    try {
      const newStatus = !status;
      setStatus(newStatus);
      const response = await updateAddonStatus(addonId, newStatus);

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

const AddonStatus = ({
  status,
  addonId,
  refreshAddon,
}: {
  status: boolean;
  addonId: string;
  refreshAddon: () => void;
}) => {
  return (
    <div>
      <AddonToggle
        isActive={status}
        addonId={addonId}
        refreshAddon={refreshAddon}
      />
    </div>
  );
};

export default AddonStatus;

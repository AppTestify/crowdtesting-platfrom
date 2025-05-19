import { IAddon } from "@/app/_interface/addon";
import { getViewAddonService } from "@/app/_services/addon.service";
import toasterService from "@/app/_services/toaster-service";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import React, { useEffect, useState } from "react";

export default function ViewAddOn({
  addon,
  sheetOpen,
  setSheetOpen,
}: // refreshAddon,
{
  addon: IAddon | null;
  // refreshAddon: () => void;
  sheetOpen: boolean;
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
  const [addonData, setAddonData] = useState<IAddon>();
  const [open, setOpen] = useState(false);

  const addonId = addon?.id || (addon?._id as string);

  const getAddon = async () => {
    try {
      setIsViewLoading(true);
      const data = await getViewAddonService(addonId);
      if (data) {
        setAddonData(data);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsViewLoading(false);
    }
  };
  useEffect(() => {
    if (sheetOpen && addonId) {
      getAddon();
    }
  }, [sheetOpen, addonId]);

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-2xl font-semibold">
            Addon Model Details
          </SheetTitle>
        </SheetHeader>

        {isViewLoading ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Loading...
          </p>
        ) : addonData ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-sm bg-gray-50 p-4 rounded-lg shadow-sm">
            <DetailItem label="Package Name" value={addonData.name} />
            <DetailItem label="Currency" value={addonData.currency} />
            <DetailItem label="Amount" value={addonData.amount} />
            <DetailItem
              label="Active"
              value={addonData.isActive ? "Yes" : "No"}
            />
            <div className="sm:col-span-2">
              <DetailItem
                label="Description"
                value={addonData.description || "No Description"}
              />
            </div>
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No data found.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-bold text-black-500">{label}</span>
      <span className="text-base font-medium text-black-500">{value}</span>
    </div>
  );
}

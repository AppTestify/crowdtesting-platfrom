import { IPackage } from "@/app/_interface/package";
import { getViewPricingService } from "@/app/_services/package.service";
import toasterService from "@/app/_services/toaster-service";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import React, { useEffect, useState } from "react";

export default function ViewPacakgeModel({
  packages,
  sheetOpen,
  setSheetOpen,
}: {
  packages: IPackage | null;
  sheetOpen: boolean;
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
  const [packageData, setPackageData] = useState<IPackage>();
  const packageId = packages?.id || (packages?._id as string);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const getPackage = async () => {
    try {
      setIsViewLoading(true);
      const data = await getViewPricingService(packageId);

      if (data) {
        setPackageData(data.packageData);
      }
    } catch (error) {
      toasterService.error("Failed to fetch packages.");
    } finally {
      setIsViewLoading(false);
    }
  };

  useEffect(() => {
    if (sheetOpen && packageId) {
      getPackage();
    }
  }, [sheetOpen, packageId]);

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-2xl font-semibold">
            Package Model Details
          </SheetTitle>
        </SheetHeader>

        {isViewLoading ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Loading...
          </p>
        ) : packageData ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-sm bg-gray-50 p-4 rounded-lg shadow-sm">
            <DetailItem label="Package Type" value={packageData.type} />
            <DetailItem label="Package Name" value={packageData.name} />
            <DetailItem label="Testers" value={packageData.testers} />
            <DetailItem
              label="Amount"
              value={`${packageData.currency} ${packageData.amount}`}
            />
            <DetailItem
              label="Duration (hrs)"
              value={packageData.durationHours ?? "N/A"}
            />
            <DetailItem label="Bugs" value={packageData.bugs} />
            <DetailItem
              label="More Bugs"
              value={packageData.moreBugs ? "Yes" : "No"}
            />
            <DetailItem
              label="Active"
              value={packageData.isActive ? "Yes" : "No"}
            />
            <DetailItem
              label="Custom"
              value={packageData.isCustom ? "Yes" : "No"}
            />

            <DetailItem
              label="Description"
              value={packageData.description || "No Description"}
            />
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
      <span className="text-base font-medium text-gray-900">{value}</span>
    </div>
  );
}

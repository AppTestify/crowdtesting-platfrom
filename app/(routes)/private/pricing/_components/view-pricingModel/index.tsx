import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import React, { useState } from "react";

export default function ViewPricingModel({
  sheetOpen,
  setSheetOpen,
  refreshUsers,
}: {
  refreshUsers: () => void;
  sheetOpen: boolean;
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {

  return (
    <div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>View Pricing Model</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              My Name is Rahul Kumar Chaursia
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

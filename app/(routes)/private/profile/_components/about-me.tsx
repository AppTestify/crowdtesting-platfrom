"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/text-area";
import { useEffect, useState } from "react";

const AboutMe = () => {
  const [yourseSelf, setYourself] = useState<string>("");
  const [yourSelfData, setYourData] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const updateYourSelf = () => {
    setYourData(yourseSelf);
    setYourself("");
  };

  useEffect(() => {
    if (yourSelfData?.length > 0) {
      setIsEditMode(!isEditMode);
    }
  }, [yourSelfData]);

  return (
    <div className="p-8 pt-0">
      <div className="w-full flex justify-between items-center mb-2 ">
        <label className="text-sm">
          {yourSelfData.length === 0 &&
            "No Info Found ! , Please Update about yourself"}
        </label>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="h-6 text-xs">
              {yourSelfData.length === 0 ? "Update" : "Edit"}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {isEditMode ? "Edit" : "Add"} About Yourself
              </SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="flex-1 items-center">
                <Textarea
                  value={yourseSelf}
                  onChange={(e) => setYourself(e.target.value)}
                  className="w-full h-80"
                  placeholder="Type your self here."
                />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button
                  className="mt-4"
                  disabled={!yourseSelf}
                  onClick={() => updateYourSelf()}
                  type="submit"
                >
                  Save
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="w-[1019px] h-[350px] justify-between  overflow-y-auto mt-3">
        {yourSelfData && yourSelfData}
      </div>
    </div>
  );
};

export default AboutMe;

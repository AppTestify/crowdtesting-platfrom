"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { uploadProfilePictureService } from "@/app/_services/user.service";
import toasterService from "@/app/_services/toaster-service";
import { Loader2 } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import { DESKTOP_BREAKPOINT } from "@/app/_constants/media-queries";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface UploadProfilePictureProps {
  refreshProfilePicture: () => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function UploadProfilePicture({
  refreshProfilePicture,
  isOpen,
  setIsOpen,
}: UploadProfilePictureProps) {
  const isDesktop = useMediaQuery({ query: DESKTOP_BREAKPOINT });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const validTypes = ["image/png", "image/jpeg"];
    const file = event.target.files?.[0];

    if (file && validTypes.includes(file.type)) {
      setAvatar(file);
      setValidationMessage("");
    } else {
      setAvatar(null);
      setValidationMessage("Only PNG and JPEG formats are accepted.");
    }
  };

  const handleFileUpdate = async () => {
    try {
      setIsLoading(true);
      if (avatar) {
        const response = await uploadProfilePictureService(avatar);

        if (response?.message) {
          toasterService.success(response.message);
          setIsOpen(false);
          refreshProfilePicture();
          setIsLoading(false);
        }
      }
    } catch (error) {
      toasterService.error();
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsLoading(false);
    setValidationMessage("");
    setAvatar(null);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);


  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload profile picture</DialogTitle>
          <DialogDescription>
            Profile picture are used to personalize your profile.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label
              htmlFor="link"
              className={`${validationMessage ? "text-destructive" : ""}`}
            >
              Profile picture
            </Label>
            <Input id="picture" type="file" onChange={handleFileChange} />
            {validationMessage ? (
              <span className="text-[0.8rem] font-medium text-destructive">
                {validationMessage}
              </span>
            ) : null}
          </div>
        </div>
        <DialogFooter>
          <Button variant={"outline"} onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!avatar || isLoading}
            onClick={() => handleFileUpdate()}
            className="w-full md:w-fit"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? "Uploading" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Upload profile picture</DrawerTitle>
           <DrawerDescription>Profile picture are used to personalize your profile.</DrawerDescription>
        </DrawerHeader>

        <div className="flex items-center space-x-2 px-4">
          <div className="grid flex-1 gap-2">
            <Label
              htmlFor="link"
              className={`${validationMessage ? "text-destructive" : ""}`}
            >
              Profile picture
            </Label>
            <Input id="picture" type="file" onChange={handleFileChange} />
            {validationMessage ? (
              <span className="text-[0.8rem] font-medium text-destructive">
                {validationMessage}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2 p-4">
          <Button
            className="w-full"
            variant={"outline"}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="w-full"
            disabled={!avatar || isLoading}
            onClick={() => handleFileUpdate()}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? "Uploading" : "Upload"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

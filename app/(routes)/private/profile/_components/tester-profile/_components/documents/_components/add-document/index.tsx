"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import toasterService from "@/app/_services/toaster-service";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DOCUMENT_TYPES } from "../../_constants";
import { uploadFileService } from "@/app/_services/file.service";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "react-responsive";
import { DESKTOP_BREAKPOINT } from "@/app/_constants/media-queries";

interface AddDocumentProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refreshDocuments: () => void;
}

export default function AddDocument({
  isOpen,
  setIsOpen,
  refreshDocuments,
}: AddDocumentProps) {
  const isDesktop = useMediaQuery({ query: DESKTOP_BREAKPOINT });

  const [file, setFile] = useState<any>(null);
  const [fileType, setFileType] = useState<string>("");
  const [fileValidationMessage, setValidationMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const maxSize = 15 * 1024 * 1024;

      if (file.size > maxSize) {
        setFile(null);
        setValidationMessage("File size should be less than 15MB.");
        return;
      }

      setFile(file);
      setValidationMessage("");
    } else {
      setFile(null);
      setValidationMessage("Only PNG and JPEG formats are accepted.");
    }
  };

  const handleFileUpdate = async () => {
    try {
      setIsLoading(true);
      if (file) {
        const response = await uploadFileService(file, fileType);

        if (response?.message) {
          toasterService.success(response.message);
          setIsOpen(false);
          setIsLoading(false);
          refreshDocuments();
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
    setFileType("");
    setFile(null);
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
            <DialogTitle>Upload document</DialogTitle>
            <DialogDescription>
              Please make sure the file is below 15MB
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-y-3 flex-col">
            <div className="grid flex-1 gap-2">
              <Label
                htmlFor="link"
                className={`${fileValidationMessage ? "text-destructive" : ""}`}
              >
                Type
              </Label>
              <Select onValueChange={(value) => setFileType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {DOCUMENT_TYPES.map((document) => (
                      <SelectItem value={document}>{document}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid flex-1 gap-2">
              <Label
                htmlFor="link"
                className={`${fileValidationMessage ? "text-destructive" : ""}`}
              >
                Document
              </Label>
              <Input id="picture" type="file" onChange={handleFileChange} />
              {fileValidationMessage ? (
                <span className="text-[0.8rem] font-medium text-destructive">
                  {fileValidationMessage}
                </span>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button variant={"outline"} onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!file || !fileType || isLoading}
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
          <DrawerTitle>Upload document</DrawerTitle>
          <DrawerDescription>
            Please make sure the file is below 15MB
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex justify-center space-y-3 flex-col px-4">
          <div className="grid flex-1 gap-2">
            <Label
              htmlFor="link"
              className={`${fileValidationMessage ? "text-destructive" : ""}`}
            >
              Type
            </Label>
            <Select onValueChange={(value) => setFileType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {DOCUMENT_TYPES.map((document) => (
                    <SelectItem value={document}>{document}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid flex-1 gap-2">
            <Label
              htmlFor="link"
              className={`${fileValidationMessage ? "text-destructive" : ""}`}
            >
              Document
            </Label>
            <Input id="picture" type="file" onChange={handleFileChange} />
            {fileValidationMessage ? (
              <span className="text-[0.8rem] font-medium text-destructive">
                {fileValidationMessage}
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
            disabled={!file || !fileType || isLoading}
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

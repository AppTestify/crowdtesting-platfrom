import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "react-responsive";
import { DESKTOP_BREAKPOINT } from "@/app/_constants/media-queries";
import { Loader2 } from "lucide-react";

export function ConfirmationDialog({
  isOpen,
  setIsOpen,
  title,
  description,
  isLoading,
  successLabel,
  successLoadingLabel,
  successVariant = null,
  successAction,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  isLoading: boolean;
  successAction: () => void;
  successLabel: string;
  successLoadingLabel: string;
  successVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
  description?: string;
}) {
  const isDesktop = useMediaQuery({ query: DESKTOP_BREAKPOINT });

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription> {description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant={"outline"} onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={successVariant}
              disabled={isLoading}
              onClick={() => successAction()}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? successLoadingLabel : successLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription> {description}</DrawerDescription>}
        </DrawerHeader>
        <div className="flex gap-2 p-4">
          <Button
            className="w-full"
            variant={"outline"}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant={successVariant}
            className="w-full"
            disabled={isLoading}
            onClick={() => successAction()}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? successLoadingLabel : successLabel}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

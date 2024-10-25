"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { capitalizeFirstLetter } from "@/app/_constants/capitalize";

export default function ItemListing({ defualtItems, info }: any) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [items, setItems] = React.useState(defualtItems || []);
  const [customItem, setCustomItem] = React.useState<string>("");
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const handleSelect = (currentValue: string, label: string) => {
    if (!selectedItems.includes(label)) {
      setSelectedItems((prev) => [...prev, label]);
    }
    setValue(currentValue === value ? "" : currentValue);
    setOpen(false);
  };
  const handleRemove = (label: string) => {
    setSelectedItems((prev) => prev.filter((item) => item !== label)); // Remove the selected label
  };

  const saveCustomItem = () => {
    const newCertificate = {
      value: customItem?.toLowerCase(),
      label: capitalizeFirstLetter(customItem),
    };
    setItems((prev) => [...prev, newCertificate]);
    setCustomItem("");
  };

  const ItemSheet = (title: string, type: Number) => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {type === 1 ? (
          <Button className="h-6 text-xs">{title}</Button>
        ) : (
          <span className="cursor-pointer">{title}</span>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add {info}</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="flex-1 items-center">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={customItem}
              onChange={(e) => setCustomItem(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              disabled={!customItem}
              onClick={saveCustomItem}
              type="submit"
            >
              Save changes
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="p-8 pt-0">
      <div className=" w-[1018px] flex justify-between items-center mb-2 ">
        <label className="text-sm">{info}</label>
        {ItemSheet(`Add Custom ${info}`, 1)}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[1019px] justify-between"
          >
            Select
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[1019px] p-0">
          <Command>
            <CommandInput placeholder="Search" className="h-9" />
            <CommandList>
              <CommandEmpty>
                No {info} found,{" "}
                <span className="cursor-pointer">
                  {ItemSheet(`Please add a new ${info}`, 2)}
                </span>
              </CommandEmpty>
              <CommandGroup>
                {Array.from(
                  new Map(
                    items.map((certificate) => [certificate.value, certificate])
                  ).values()
                )
                  .filter(
                    (certificate) => !selectedItems.includes(certificate.label)
                  )
                  .map((certificate) => (
                    <CommandItem
                      key={certificate.value}
                      value={certificate.value}
                      onSelect={() =>
                        handleSelect(certificate.value, certificate.label)
                      }
                      disabled={selectedItems.includes(certificate.label)}
                    >
                      {certificate.label}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === certificate.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="w-[1019px] h-[280px] justify-between   mt-3  ">
        <CardHeader>
          {selectedItems.length === 0 && (
            <CardDescription className="ml-[-1.2rem]">
              No {info} Selected
            </CardDescription>
          )}

          <CardDescription className="pt-6 ml-[-1.2rem]">
            {selectedItems?.map((select, index) => {
              return (
                <Badge
                  key={index}
                  variant="secondary"
                  className="w-[auto] mr-2 mt-3 p-1.5 pl-3 rounded-full"
                >
                  {select}

                  <span
                    onClick={() => handleRemove(select)}
                    className="ml-5 cursor-pointer"
                    role="button"
                    aria-label="Remove certificate"
                  >
                    <Icons.CrossIcon />
                  </span>
                </Badge>
              );
            })}
          </CardDescription>
        </CardHeader>
      </div>
    </div>
  );
}

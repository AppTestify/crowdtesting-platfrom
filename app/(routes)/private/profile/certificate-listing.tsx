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
import { FormControl } from "@/components/ui/form";

export default function CertificateListing({ Defaultcertificates, info }: any) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [certificates, setCertificates] = React.useState(
    Defaultcertificates || []
  );
  const [customCertificate, setCustomCertificate] = React.useState<string>();
  const [selectedCertificates, setSelectedCertificates] = React.useState<
    string[]
  >([]);

  const handleSelect = (currentValue: string, label: string) => {
    if (!selectedCertificates.includes(label)) {
      setSelectedCertificates((prev) => [...prev, label]);
    }
    setValue(currentValue === value ? "" : currentValue);
    setOpen(false);
  };
  const handleRemove = (label: string) => {
    setSelectedCertificates((prev) => prev.filter((item) => item !== label)); // Remove the selected label
  };

  const saveCustomCertificate = () => {
    const newCertificate = {
      value: customCertificate?.toLowerCase(),
      label: customCertificate,
    };
    setCertificates((prev) => [...prev, newCertificate]);
    setCustomCertificate("");
  };

  return (
    <div className="p-8  pt-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[1019px] justify-between"
          >
            Select 
            {/* {value
              ? certificates.find((certificat) => certificat.value === value)
                  ?.label
              : "Select"} */}
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
                  <Sheet>
                    <SheetTrigger asChild>
                      <span>{`Please add a new ${info}`}</span>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Add {info}</SheetTitle>
                      </SheetHeader>
                      <div className="grid gap-4 py-4">
                        <div className=" items-center ">
                          <div className="flex-1">
                            <Label htmlFor="name" className="text-right">
                              Name
                            </Label>
                            <Input
                              value={customCertificate}
                              onChange={(e) =>
                                setCustomCertificate(e.target.value)
                              }
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                      <SheetFooter>
                        <SheetClose asChild>
                          <Button onClick={saveCustomCertificate} 
                          disabled={!customCertificate}
                          type="submit">
                            Save
                          </Button>
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </span>
              </CommandEmpty>
              <CommandGroup>
                {Array.from(
                  new Map(
                    certificates.map((certificate) => [
                      certificate.value,
                      certificate,
                    ])
                  ).values()
                )
                  .filter(
                    (certificate) =>
                      !selectedCertificates.includes(certificate.label)
                  )
                  .map((certificate) => (
                    <CommandItem
                      key={certificate.value}
                      value={certificate.value}
                      onSelect={() =>
                        handleSelect(certificate.value, certificate.label)
                      }
                      disabled={selectedCertificates.includes(
                        certificate.label
                      )}
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

      <div className="w-[1019px] h-[300px] justify-between   mt-10 ">
        <CardHeader>
          {selectedCertificates.length === 0 && (
            <CardDescription className="ml-[-1.2rem]">
              No {info} Selected
            </CardDescription>
          )}

          <CardDescription className="pt-6 ml-[-1.2rem]">
            {selectedCertificates?.map((select, index) => {
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

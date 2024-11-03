import React, { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckIcon, Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CERTIFICATES } from "../../_constants";
import { CaretSortIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";

const certificationSchema = z.object({
  name: z.string().min(1, "Required"),
  issuedBy: z.string().optional(),
});

export type ICertification = z.infer<typeof certificationSchema>;

interface CertificationsProps {
  form: any;
  certifications: ICertification[];
  onChange: (certifications: ICertification[]) => void;
}

const Certifications: React.FC<CertificationsProps> = ({
  form,
  certifications = [],
  onChange,
}) => {
  const [defaultCertificates, setDefaultCertificates] =
    useState<string[]>(CERTIFICATES);
  const [searchString, setSearchString] = useState<string>("");

  const handleAddCertification = () => {
    onChange([...certifications, { name: "", issuedBy: "" }]);
  };

  const handleRemoveCertification = (index: number) => {
    const newCertifications = certifications.filter((_, idx) => idx !== index);
    onChange(newCertifications);
  };

  const addCustomCertificate = () => {
    setDefaultCertificates([searchString, ...defaultCertificates]);
  };

  const setSearchValue = (event: any) => {
    setSearchString(event.target.value);
  };

  const shouldShowAddButton = () => {
    if (!searchString) {
      return false;
    }

    if (
      defaultCertificates.find((certificate) => certificate === searchString)
    ) {
      return false;
    }

    return true;
  };

  return (
    <div>
      <div className="flex flex-col mb-3 gap-1">
        <span className="text-lg">Certifications</span>
        <span className="text-gray-500 text-xs">
          Please add your certifications below; it helps us better filter you
          for your job.
        </span>
      </div>
      {certifications.map((certification, index) => (
        <div key={index} className="flex gap-4 mb-3 flex-col lg:flex-row">
          <FormField
            control={form.control}
            name={`certifications.${index}.name`}
            render={({ field }) => (
              <FormItem className="flex flex-col flex-[4] gap-2 !mt-[2px]">
                <FormLabel>Certificate</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? defaultCertificates.find(
                              (certificate) => certificate === field.value
                            )
                          : "Select certificate"}
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-full">
                    <Command>
                      <CommandInput
                        placeholder="Search"
                        className="h-9"
                        onChangeCapture={(event) => setSearchValue(event)}
                      />
                      <CommandList>
                        <CommandEmpty className="p-2">
                          <span className="text-sm">No certificate found</span>
                        </CommandEmpty>

                        <CommandGroup>
                          {shouldShowAddButton() ? (
                            <CommandItem
                              value={searchString}
                              key={searchString}
                              onSelect={() => {
                                addCustomCertificate();
                                form.setValue(
                                  `certifications.${index}.name`,
                                  searchString
                                );
                              }}
                            >
                              {searchString}
                              <CheckIcon
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  searchString === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ) : null}

                          {defaultCertificates.map((certificate) => (
                            <CommandItem
                              value={certificate}
                              key={certificate}
                              onSelect={() => {
                                form.setValue(
                                  `certifications.${index}.name`,
                                  certificate
                                );
                              }}
                            >
                              {certificate}
                              <CheckIcon
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  certificate === field.value
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`certifications.${index}.issuedBy`}
            render={({ field }) => (
              <FormItem className={"flex-[3]"}>
                <FormLabel>Issued By</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex flex-col">
            <FormLabel className={"hidden lg:invisible lg:flex "}>Issued By</FormLabel>

            <Button
              type="button"
              onClick={() => handleRemoveCertification(index)}
              variant="ghost"
              size="icon"
              className="lg:mt-4"
              disabled={certifications.length === 1}
            >
              <Trash size={16} />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant={"link"}
        className="p-0 underline"
        onClick={handleAddCertification}
      >
        + Add Certification
      </Button>
    </div>
  );
};

export default Certifications;

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
import { CheckIcon, Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CaretSortIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SKILLS } from "../../_constants";

const skillSchema = z.string().optional();

export type ISkill = z.infer<typeof skillSchema>;

interface SkillsProps {
  form: any;
  skills: ISkill[];
  onChange: (skills: ISkill[]) => void;
}

const Skills: React.FC<SkillsProps> = ({ form, skills = [], onChange }) => {
  const [defaultSkills, setDefaultSkills] = useState<string[]>(SKILLS);
  const [searchString, setSearchString] = useState<string>("");

  const handleAddSkill = () => {
    onChange([...skills, ""]);
  };

  const handleRemoveSkill = (index: number) => {
    const newSkills = skills.filter((_, idx) => idx !== index);
    onChange(newSkills);
  };

  const addCustomSkill = () => {
    setDefaultSkills([searchString, ...defaultSkills]);
  };

  const setSearchValue = (event: any) => {
    setSearchString(event.target.value);
  };

  const shouldShowAddButton = () => {
    if (!searchString) {
      return false;
    }

    if (defaultSkills.find((skill) => skill === searchString)) {
      return false;
    }

    return true;
  };

  return (
    <div>
      <div className="flex flex-col mb-3 gap-1">
        <span className="text-lg">Skills</span>
        <span className="text-gray-500 text-xs">
          Please add your skills below; it helps us better filter you for your
          job.
        </span>
      </div>
      {skills.map((skill, index) => (
        <div key={index} className="flex gap-4 mb-3">
          <FormField
            control={form.control}
            name={`skills.${index}`}
            render={({ field }) => (
              <FormItem className="flex flex-col flex-[4] gap-2 !mt-[2px]">
                <FormLabel>Skill</FormLabel>
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
                          ? defaultSkills.find((s) => s === field.value)
                          : "Select skill"}
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
                          <span className="text-sm">No skill found</span>
                        </CommandEmpty>

                        <CommandGroup>
                          {shouldShowAddButton() ? (
                            <CommandItem
                              value={searchString}
                              key={searchString}
                              onSelect={() => {
                                addCustomSkill();
                                form.setValue(`skills.${index}`, searchString);
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

                          {defaultSkills.map((skill) => (
                            <CommandItem
                              value={skill}
                              key={skill}
                              onSelect={() => {
                                form.setValue(`skills.${index}`, skill);
                              }}
                            >
                              {skill}
                              <CheckIcon
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  skill === field.value
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

          <div className="flex flex-col">
            <FormLabel className={"invisible"}>Skill</FormLabel>

            <Button
              type="button"
              onClick={() => handleRemoveSkill(index)}
              variant="ghost"
              size="icon"
              className="mt-4"
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
        onClick={handleAddSkill}
      >
        + Add Skill
      </Button>
    </div>
  );
};

export default Skills;

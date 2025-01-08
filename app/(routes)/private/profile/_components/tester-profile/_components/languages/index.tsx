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
import { Trash } from "lucide-react";
import { LANGUAGES } from "../../_constants";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const languageSchema = z.object({
    name: z.string().min(1, "Required"),
    proficiency: z.string().optional(),
});

export type ILanguage = z.infer<typeof languageSchema>;

interface LanguagesProps {
    form: any;
    languages: ILanguage[];
    onChange: (certifications: ILanguage[]) => void;
}

const Languages: React.FC<LanguagesProps> = ({
    form,
    languages = [],
    onChange,
}) => {
    const handleAddLanguage = () => {
        onChange([...languages, { name: "", proficiency: "" }]);
    };

    const handleRemoveLanguage = (index: number) => {
        const newCertifications = languages.filter((_, idx) => idx !== index);
        onChange(newCertifications);
    };

    return (
        <div>
            <div className="flex flex-col mb-3 gap-1">
                <span className="text-lg">Languages</span>
                <span className="text-gray-500 text-xs">
                    Please add your languages below; it helps us better filter you
                    for your job.
                </span>
            </div>
            {languages.map((language, index) => (
                <div key={index} className="flex gap-4 mb-3 flex-col lg:flex-row">
                    <FormField
                        control={form.control}
                        name={`languages.${index}.name`}
                        render={({ field }) => (
                            <FormItem className={"flex-[3]"}>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name={`languages.${index}.proficiency`}
                        render={({ field }) => (
                            <FormItem className="flex flex-col flex-[4] gap-2 !mt-[2px]">
                                <FormLabel>Proficiency</FormLabel>
                                <Select
                                    onValueChange={(value: string) => {
                                        form.setValue(`languages.${index}.proficiency`, value);
                                    }}
                                    value={field.value}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {LANGUAGES.map((certificate) => (
                                                <SelectItem key={certificate} value={certificate}>
                                                    {certificate}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col">
                        <FormLabel className={"hidden lg:invisible lg:flex "}>Issued By</FormLabel>

                        <Button
                            type="button"
                            onClick={() => handleRemoveLanguage(index)}
                            variant="ghost"
                            size="icon"
                            className="lg:mt-4"
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
                onClick={handleAddLanguage}
            >
                + Add language
            </Button>
        </div>
    );
};

export default Languages;

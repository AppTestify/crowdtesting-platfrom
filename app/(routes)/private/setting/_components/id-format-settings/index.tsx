"use client"

import { IIdFormat } from '@/app/_interface/id-format';
import { getIdFormatService, updateIdFormatService } from '@/app/_services/id-format-service';
import toasterService from '@/app/_services/toaster-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'

export default function IdFormatSettings() {

    const [idFormats, setIdFormats] = useState<IIdFormat[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [idFormatUpdateId, setIdFormatUpdateId] = useState<string>("");

    const getIdFormat = async () => {
        try {
            const response = await getIdFormatService();
            setIdFormats(response);
        } catch (error) {
            toasterService.error();
        }
    }

    useEffect(() => {
        getIdFormat();
    }, []);

    const handlePrefixSuffixChange = (index: number, part: string, value: string) => {
        const updatedFormats = [...idFormats];
        const [prefix, suffix] = updatedFormats[index].idFormat.split('{customId}');
        if (part === 'prefix') {
            updatedFormats[index].idFormat = value + '{customId}' + suffix;
        } else {
            updatedFormats[index].idFormat = prefix + '{customId}' + value;
        }
        setIdFormats(updatedFormats);
    };

    const getFormattedId = (idFormat: string) => {
        return idFormat.replace('{customId}', '1');
    };

    const updateIdFormat = async (idFormat: IIdFormat) => {
        setIsLoading(true);
        try {
            setIdFormatUpdateId(idFormat?._id as string);
            const response = await updateIdFormatService(idFormat?._id as string, idFormat);
            if (response) {
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mt-2 p-1">
            {idFormats.map((idFormat, index) => {
                const [prefix, suffix] = idFormat.idFormat.split('{customId}');
                return (
                    <div key={index}>
                        <div className="whitespace-nowrap mb-1">{idFormat.entity} ID Format</div>
                        <div className="flex mb-4 gap-2 items-center">
                            <Input
                                type="text"
                                value={prefix}
                                onChange={(e) => handlePrefixSuffixChange(index, 'prefix', e.target.value)}
                                className="border p-2 rounded w-[20%]"
                            />
                            <span className="p-2 bg-gray-100 rounded">{'{customId}'}</span>
                            <Input
                                type="text"
                                value={suffix}
                                onChange={(e) => handlePrefixSuffixChange(index, 'suffix', e.target.value)}
                                className="flex-1 border p-2 rounded"
                            />
                            <span className=" p-2 bg-gray-100 rounded">
                                {getFormattedId(`${prefix}{customId}${suffix}`)}
                            </span>
                            <span className=''>
                                <Button onClick={() => updateIdFormat(idFormat)}>
                                    {isLoading && (idFormatUpdateId === idFormat._id) ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {isLoading && (idFormatUpdateId === idFormat._id) ? "Updating" : "Update"}
                                </Button>
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

"use client";

import { countries } from '@/app/_constants/countries';
import toasterService from '@/app/_services/toaster-service';
import { getAvatarFallbackText, getFormattedBase64ForSrc } from '@/app/_utils/string-formatters';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import UploadLogo from '../upload-logo';
import { deleteWebsiteLogoService, getWebsiteService, updateWebsiteService } from '@/app/_services/setting.service';
import { IWebsite } from '@/app/_interface/website';
import { useSession } from 'next-auth/react';
import { ConfirmationDialog } from '@/app/_components/confirmation-dialog';

const generalSettingSchema = z.object({
    websiteName: z.string().min(1, "Required"),
    timeZone: z.string().min(1, 'Required')
});

export default function GeneralSettings() {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
    const [isUploadLogoOpen, setIsUploadLogoOpen] =
        useState(false);
    const [websites, setWebsites] = useState<IWebsite | null>(null);
    const [isDeleteLogoOpen, setIsDeleteLogoOpen] = useState<boolean>(false);
    const [user, setUser] = useState<any | null>();
    const { data } = useSession();
    const { update } = useSession();

    useEffect(() => {
        if (data && data?.user) {
            setUser(data.user);
        }
    }, [data]);

    const form = useForm<z.infer<typeof generalSettingSchema>>({
        resolver: zodResolver(generalSettingSchema),
        defaultValues: {
            websiteName: websites?.websiteName || "",
            timeZone: websites?.timeZone || "",
        },
    });

    const getWebsites = async () => {
        try {
            const response = await getWebsiteService();
            setWebsites(response);
        } catch (error) {
            toasterService.error();
        }
    }

    const RefreshWebsites = () => {
        getWebsites();
        update();
    }

    async function onSubmit(values: z.infer<typeof generalSettingSchema>) {
        setIsLoading(true);
        try {
            const response = await updateWebsiteService({
                ...values,
            });
            if (response) {
                RefreshWebsites();
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    const deleteLogo = async () => {
        setIsDeleteLoading(true);
        try {
            const response = await deleteWebsiteLogoService();

            if (response?.message) {
                toasterService.success(response.message);
                setIsDeleteLogoOpen(false);
                RefreshWebsites();
                setIsDeleteLoading(false);
            }
        } catch (error) {
            toasterService.error();
            setIsDeleteLoading(false);
            setIsDeleteLogoOpen(false);
        }
    };

    const setFormDefaultValues = (website: any) => {
        setWebsites(website);
        form.reset({
            websiteName: website[0]?.websiteName || "",
            timeZone: website[0]?.timeZone || "",
        });
    };

    useEffect(() => {
        getClientByUserId();
    }, []);

    const getClientByUserId = async () => {
        setFormDefaultValues(await getWebsiteService());
    };

    const uniqueTimeZones = Array.from(
        new Set(
            countries.flatMap(country =>
                country.timezone.map(timeZone => timeZone.zoneName)
            )
        )
    );


    return (
        <div className='w-full'>

            {/* upload new logo */}
            <UploadLogo
                isOpen={isUploadLogoOpen}
                setIsOpen={setIsUploadLogoOpen}
                RefreshWebsites={RefreshWebsites}
            />

            {/* delete logo */}
            <ConfirmationDialog
                isOpen={isDeleteLogoOpen}
                setIsOpen={setIsDeleteLogoOpen}
                title="Remove logo"
                description="Are you sure you want remove your logo?"
                isLoading={isDeleteLoading}
                successAction={deleteLogo}
                successLabel="Delete"
                successLoadingLabel="Deleting"
                successVariant={"destructive"}
            />

            <div className="flex flex-col mb-3 gap-1 mt-2">
                <span className="text-lg">General settings</span>
                {/* <span className="text-gray-500 text-xs">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Pariatur error magni cumque in nostrum atque, tempora optio neque est numquam.
                </span> */}
            </div>
            <div className="mt-3">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                        <div className="grid grid-cols-2 gap-2">
                            <FormField
                                control={form.control}
                                name="websiteName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="timeZone"
                                render={({ field }) => (
                                    <FormItem className="">
                                        <FormLabel>Time zone</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent side='bottom'>
                                                <SelectGroup>
                                                    {uniqueTimeZones.map((zoneName, index) => (
                                                        <SelectItem key={index} value={zoneName}>
                                                            {zoneName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-2 mt-2">
                            <div className="flex justify-between items-center border border-1 rounded-md px-3 py-2">
                                <div className="flex gap-4 items-center">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage
                                            src={getFormattedBase64ForSrc(websites?.logo)}
                                            alt="@logo"
                                        />
                                        <AvatarFallback>
                                            {getAvatarFallbackText({
                                                ...user,
                                                name: `${user?.firstName || ""} ${user?.lastName || ""
                                                    }`,
                                            })}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-medium text-sm">Logo</span>
                                        <span className="text-gray-500 text-xs">PNG, JPEG</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={"outline"}
                                        size={"sm"}
                                        type='button'
                                        onClick={() => setIsUploadLogoOpen(true)}
                                    >
                                        Upload new logo
                                    </Button>
                                    <Button
                                        variant={"secondary"}
                                        size={"sm"}
                                        type='button'
                                        disabled={!websites?.logo}
                                        onClick={() => setIsDeleteLogoOpen(true)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>

                        < div className="mt-6 w-full flex justify-end gap-2" >
                            <Button
                                disabled={isLoading}
                                type="submit"
                                size="lg"
                                className="w-full md:w-fit"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                {isLoading ? "Updating" : "Update"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div >
    )
}

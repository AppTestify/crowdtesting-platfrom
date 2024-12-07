"use client"

import { IAdminEmail, ISelectedAdminEmail } from '@/app/_interface/admin';
import { getAdminEmailService, getSelectedAdminEmailService, updateAdminEmailService } from '@/app/_services/admin.service';
import toasterService from '@/app/_services/toaster-service';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'

export default function SupportMail() {
    const [adminEmails, setAdminEmails] = useState<IAdminEmail[]>([]);
    const [selectedEmails, setSelectedEmails] = useState<ISelectedAdminEmail | null>(null);
    const [supportEmails, setSupportEmails] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isUpdateloading, setIsUpdateLoading] = useState<boolean>(false);
    const [isInvalidEmails, setIsInvalidEmails] = useState<boolean>(false);

    const validateEmails = () => {
        if (supportEmails.length === 0) {
            setIsInvalidEmails(true);
            return false;
        }
        setIsInvalidEmails(false);
        return true;
    };

    useEffect(() => {
        if (supportEmails.length > 0) {
            setIsInvalidEmails(false);
        }
    }, [supportEmails]);

    // for dropdown
    const getAdminEmail = async () => {
        setLoading(true);
        try {
            const response = await getAdminEmailService();
            setAdminEmails(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setLoading(false);
        }
    }

    // selected emails
    const getSelectedEmails = async () => {
        try {
            const response = await getSelectedAdminEmailService();
            if (response) {
                setSelectedEmails(response);
            }
        } catch (error) {
            toasterService.error();
        }
    }

    const updateAdminEmail = async () => {
        if (!validateEmails()) {
            return;
        }
        setIsUpdateLoading(true);
        try {
            const response = await updateAdminEmailService({ emails: supportEmails });
            if (response) {
                toasterService.success(response.message);
                getSelectedEmails();
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsUpdateLoading(false);
        }
    }

    useEffect(() => {
        getSelectedEmails();
        getAdminEmail();
    }, []);

    useEffect(() => {
        if (selectedEmails?.emails) {
            setSupportEmails(selectedEmails.emails);
        }
    }, [selectedEmails]);

    return (
        <div className="mt-4 w-full px-3">
            <div>
                Support Email
            </div>
            {supportEmails.length > 0 &&
                <>
                    <MultiSelect
                        options={adminEmails?.map((adminEmail) => ({
                            label: adminEmail?.email,
                            value: adminEmail?.email,
                        }))}
                        onValueChange={setSupportEmails}
                        defaultValue={supportEmails.length > 0 ? supportEmails : []}
                        placeholder={loading ? "Loading" : ""}
                        variant="secondary"
                        animation={2}
                        maxCount={3}
                        className="mt-2"
                    />
                    {isInvalidEmails ? (
                        <p className="mt-2">
                            Please select at least one browser
                        </p>
                    )
                        : null}
                </>
            }
            {supportEmails.length == 0 &&
                <>
                    <MultiSelect
                        options={adminEmails?.map((adminEmail) => ({
                            label: adminEmail?.email,
                            value: adminEmail?.email,
                        }))}
                        onValueChange={setSupportEmails}
                        defaultValue={supportEmails.length > 0 ? supportEmails : []}
                        placeholder={loading ? "Loading" : ""}
                        variant="secondary"
                        animation={2}
                        maxCount={3}
                        className="mt-2"
                    />
                    {isInvalidEmails ? (
                        <p className="mt-2 text-destructive">
                            Please select at least one browser
                        </p>
                    )
                        : null}
                </>
            }
            <div className="mt-6 w-full flex justify-end gap-2">
                <Button
                    disabled={isUpdateloading}
                    type="submit"
                    size="lg"
                    className="w-full md:w-fit"
                    onClick={updateAdminEmail}
                >
                    {isUpdateloading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isUpdateloading ? "Updating" : "Update"}
                </Button>
            </div>
            {selectedEmails && selectedEmails?.emails?.length > 0 ? (
                <div className="mt-4">
                    Selected Emails: {selectedEmails.emails.join(", ")}
                </div>
            ) : ""}

        </div>
    )
}

import { ISSUE_STATUS_LIST } from '@/app/_constants/issue';
import { IIssue } from '@/app/_interface/issue';
import { updateIssueStatusService } from '@/app/_services/issue.service';
import toasterService from '@/app/_services/toaster-service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const issueStatusSchema = z.object({
    status: z.string().min(1, 'Required'),
});

export default function EditIssueStatus({
    issue,
    sheetOpen,
    setSheetOpen,
    refreshIssues,
}: {
    issue: IIssue;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
    refreshIssues: () => void;
}) {
    const form = useForm<z.infer<typeof issueStatusSchema>>({
        resolver: zodResolver(issueStatusSchema),
        defaultValues: {
            status: issue?.status || "",
        },
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { projectId } = useParams<{ projectId: string }>();

    const onSubmit = async (values: z.infer<typeof issueStatusSchema>) => {
        setIsLoading(true);
        try {
            const response = await updateIssueStatusService(projectId, issue?.id, values);
            if (response) {
                refreshIssues();
                toasterService.success(response?.message);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div>
            <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit issue status</DialogTitle>
                        <DialogDescription>
                            Update the status of the issue to keep track of the progress.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                            <div className="grid gap-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Status</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue>{field.value || ""}</SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {ISSUE_STATUS_LIST.map((status) => (
                                                            <SelectItem value={status}>
                                                                {status}
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
                            <DialogFooter>
                                <Button
                                    disabled={isLoading}
                                    type="submit"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {isLoading ? "Updating" : "Update"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div >
    )
}

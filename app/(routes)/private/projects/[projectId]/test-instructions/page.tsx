"use client";

import { IProject } from '@/app/_interface/project';
import { editProjectDescriptionService, getProjectService } from '@/app/_services/project.service';
import toasterService from '@/app/_services/toaster-service';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import TextEditor from '../../_components/text-editor';
import { Button } from '@/components/ui/button';
import { Edit, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { UserRoles } from '@/app/_constants/user-roles';
import { checkProjectActiveRole } from '@/app/_utils/common-functionality';

const projectSchema = z.object({
    description: z.string().min(1, "Description is required"),
});

export default function TestInstruction() {
    const { data } = useSession();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isUpdateLoading, setIsUpdateLoading] = useState<boolean>(false);
    const [project, setProject] = useState<IProject>();
    const [userData, setUserData] = useState<any>();
    const { projectId } = useParams<{ projectId: string }>();
    const form = useForm<z.infer<typeof projectSchema>>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            description: project?.description || "",
        },
    });

    const reset = () => {
        getProject();
        setIsEditing(false);
    }

    async function onSubmit(values: z.infer<typeof projectSchema>) {
        setIsUpdateLoading(true);
        try {
            const response = await editProjectDescriptionService(projectId, values);
            if (response) {
                toasterService.success(response.message);
                reset();
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsUpdateLoading(false);
        }
    }

    const getProject = async () => {
        setIsLoading(true);
        try {
            const response = await getProjectService(projectId);
            if (response) {
                setProject(response);
                form.setValue("description", response.description || "");
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getProject();
    }, [projectId]);

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUserData(user);
        }
    }, [data]);

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const commonProjectRoleCheck = () => {
        return userData?.role !== UserRoles.TESTER && checkProjectActiveRole(project?.isActive ?? false, userData);
    }

    return (
        <div className="mt-2 mx-4">
            {!isLoading ? (
                <div>
                    {isEditing ? (
                        <div>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                                    <div className="grid grid-cols-1 gap-2 mt-4">
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <TextEditor
                                                            markup={field.value || ""}
                                                            onChange={(value) => {
                                                                form.setValue("description", value);
                                                                form.trigger("description");
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="mt-4 w-full flex justify-end gap-2">
                                        <Button
                                            disabled={isUpdateLoading}
                                            type="button"
                                            variant={"outline"}
                                            size="lg"
                                            className="w-full md:w-fit"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            disabled={isUpdateLoading}
                                            type="submit"
                                            size="lg"
                                            className="w-full md:w-fit"
                                        >
                                            {isUpdateLoading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : null}
                                            {isUpdateLoading ? "Updating" : "Update"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    ) : (
                        <div className='flex justify-between space-x-2'>
                            <div
                                className={`text-sm leading-relaxed text-gray-700 ${commonProjectRoleCheck() ? "hover:bg-gray-100 hover:rounded-sm" : ""} w-full p-2 space-y-2 rich-description`}
                                onClick={commonProjectRoleCheck() ? handleDoubleClick : undefined}
                                dangerouslySetInnerHTML={{
                                    __html: project?.description || "",
                                }}
                            />
                            {commonProjectRoleCheck() &&
                                <Button className='flex items-center justify-center' type='button' onClick={() => setIsEditing(true)}>
                                    <Edit />
                                    Edit
                                </Button>
                            }
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col space-y-3">
                    <Skeleton className="bg-gray-200 h-[225px] w-full rounded-xl" />
                </div>
            )}
        </div>
    );
}

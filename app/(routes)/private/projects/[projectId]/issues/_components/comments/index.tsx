import { IComment } from '@/app/_interface/comment';
import { addCommentService, getCommentsService } from '@/app/_services/comment.service';
import toasterService from '@/app/_services/toaster-service';
import { getAvatarFallbackText, getFormattedBase64ForSrc } from '@/app/_utils/string-formatters';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import TextEditor from '../../../../_components/text-editor';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { UserRoles } from '@/app/_constants/user-roles';

const commentSchema = z.object({
    entityId: z.string().min(1, "Required"),
    content: z.string().min(1, "Required"),
});

export default function Comments() {
    const { issueId } = useParams<{ issueId: string }>();
    const { projectId } = useParams<{ projectId: string }>();
    const [comments, setComments] = useState<IComment[]>([]);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [user, setUser] = useState<any | null>();
    const { data } = useSession();

    const form = useForm<z.infer<typeof commentSchema>>({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            entityId: issueId,
            content: "",
        },
    });

    useEffect(() => {
        if (data && data?.user) {
            setUser(data.user);
        }
    }, [data]);

    async function onSubmit(values: z.infer<typeof commentSchema>) {
        try {
            const response = await addCommentService(projectId, issueId, values);
            if (response) {
                getComments();
                reset();
            }
        } catch (error) {
            toasterService.error();
        }
    }

    const getComments = async () => {
        try {
            const response = await getCommentsService(projectId, issueId);
            setComments(response);
        } catch (error) {
            toasterService.error();
        }
    }

    const reset = () => {
        form.reset();
        setIsEdit(false);
    };

    useEffect(() => {
        getComments();
    }, [projectId, issueId]);

    return (
        <div className="mt-3">
            <div className="text-sm ">Comments</div>
            <div className="w-full mb-3 mt-2">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} method="post">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className={`flex ${!isEdit ? 'items-center' : ''}`}>
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    src={getFormattedBase64ForSrc(user?.profilePicture)}
                                                    alt="@profilePicture"
                                                />
                                                <AvatarFallback>
                                                    {getAvatarFallbackText({
                                                        ...user,
                                                        name: `${user?.firstName || ""} ${user?.lastName || ""
                                                            }`,
                                                    })}
                                                </AvatarFallback>
                                            </Avatar>
                                            {!isEdit ? (
                                                <Input
                                                    type="text"
                                                    className="ml-3 rounded-sm border border-gray-300 "
                                                    placeholder="Add a comment"
                                                    {...field}
                                                    onClick={() => setIsEdit(true)}
                                                    readOnly={true}
                                                />
                                            ) : (
                                                <div className="w-full ml-3">
                                                    <TextEditor
                                                        markup={field.value || ""}
                                                        onChange={(value) => {
                                                            form.setValue(field.name, value);
                                                            form.trigger(field.name);
                                                        }}
                                                    />
                                                    <div className="mt-3">
                                                        <Button  type="submit" size={'sm'} >
                                                            Save
                                                        </Button>
                                                        <Button type="button" variant={'ghost'} size={'sm'} className="ml-2" onClick={() => setIsEdit(false)}>
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </div>
            <div className="mt-5">
                {comments.map((comment, index) => (
                    <div
                        key={index}
                        className="flex mb-3"
                    >
                        {/* Profile Image Section */}
                        <div className="flex-shrink-0 mr-4">
                            <Avatar className="h-10 w-10 bg-gray-400">
                                <AvatarImage
                                    src={getFormattedBase64ForSrc(comment?.commentedBy?.profilePicture)}
                                    alt="@profilePicture"
                                />
                                <AvatarFallback>
                                    {getAvatarFallbackText({
                                        ...user,
                                        name: `${comment?.commentedBy?.firstName || ""} ${comment?.commentedBy?.lastName || ""}`,
                                    })}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex flex-col w-full">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">
                                    {`${comment?.commentedBy?.firstName} ${comment?.commentedBy?.lastName}`}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(comment?.createdAt || new Date()), { addSuffix: true })}
                                </span>
                            </div>

                            <div className="mt-2 text-sm text-gray-800">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: comment?.content || "",
                                    }}
                                />
                            </div>

                            <div className="mt-2">
                                {(user?._id === comment?.commentedBy?._id || user?.role === UserRoles.ADMIN) && (
                                    <div className="flex space-x-4 text-sm text-gray-600">
                                        <button className="hover:underline">Edit</button>
                                        <button className="hover:underline">Delete</button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

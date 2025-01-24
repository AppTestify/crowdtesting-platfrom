import { IComment } from '@/app/_interface/comment';
import { addCommentService, deleteCommentService, getCommentsService, updateCommentService } from '@/app/_services/comment.service';
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
import { Loader2 } from 'lucide-react';
import { ConfirmationDialog } from '@/app/_components/confirmation-dialog';
import { Skeleton } from '@/components/ui/skeleton';

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
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [commentId, setCommentId] = useState<string>("");
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

    const editForm = useForm<z.infer<typeof commentSchema>>({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            entityId: issueId,
            content: "",
        },
    });

    // Update the edit form when commentId or comments change
    useEffect(() => {
        if (commentId) {
            const currentComment = comments.find((comment) => comment._id === commentId);
            if (currentComment) {
                editForm.reset({
                    entityId: issueId,
                    content: currentComment.content || "",
                });
            }
        }
    }, [commentId, comments]);

    async function onSubmit(values: z.infer<typeof commentSchema>) {
        setIsLoading(true);
        try {
            const response = await addCommentService(projectId, issueId, values);
            if (response) {
                getComments();
                reset();
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    async function onEdit(values: z.infer<typeof commentSchema>) {
        setIsLoading(true);
        try {
            const response = await updateCommentService(commentId, projectId, issueId, values);
            if (response) {
                getComments();
                setIsEditOpen(false);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    }

    const getComments = async () => {
        setIsViewLoading(true);
        try {
            const response = await getCommentsService(projectId, issueId);
            setComments(response);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
    }

    const deleteComment = async () => {
        setIsDeleteLoading(true);
        try {
            const response = await deleteCommentService(projectId, issueId, commentId);
            if (response) {
                getComments();
                setIsDeleteOpen(false);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsDeleteLoading(false);
        }
    }

    const reset = () => {
        form.reset();
        setIsEdit(false);
    };

    const editClose = () => {
        setIsEditOpen(false);
    }

    useEffect(() => {
        getComments();
    }, [projectId, issueId]);

    const handleDelete = (id: string) => {
        setIsDeleteOpen(true);
        setCommentId(id);
    }

    const handleEdit = (id: string) => {
        setIsEditOpen(true);
        setCommentId(id);
    }

    return (
        <>
            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete comment"
                description="Are you sure you want to delete this comment?"
                isLoading={isDeleteLoading}
                successAction={deleteComment}
                successLabel="Delete"
                successLoadingLabel="Deleting"
                successVariant={"destructive"}
            />
            <div className="mt-3 mb-8">
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

                                                        <div className="mt-3 mb-2 flex items-center gap-2">
                                                            <Button disabled={isLoading} type="button" variant={'ghost'} size={'sm'} className="" onClick={reset}>
                                                                Cancel
                                                            </Button>
                                                            <Button disabled={isLoading} type="submit" size={'sm'} >
                                                                {isLoading && (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                )}
                                                                {isLoading ? 'Saving' : "Save"}
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
                {!isViewLoading ? (
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

                                    {!isEditOpen ?
                                        (
                                            <div className="mt-2 text-sm text-gray-800">
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: comment?.content || "",
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="mt-2">
                                                <Form {...editForm}>
                                                    <form onSubmit={editForm.handleSubmit(onEdit)} method="post">
                                                        <FormField
                                                            control={editForm.control}
                                                            name="content"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <div className="w-full">
                                                                            <TextEditor
                                                                                markup={field.value || ""}
                                                                                onChange={(value) => {
                                                                                    editForm.setValue(field.name, value);
                                                                                    editForm.trigger(field.name);
                                                                                }}
                                                                            />
                                                                            <div className="mt-3 mb-2 flex items-center gap-2">
                                                                                {/* Cancel Button */}
                                                                                <Button
                                                                                    disabled={isLoading}
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={editClose}
                                                                                >
                                                                                    Cancel
                                                                                </Button>

                                                                                {/* Update Button */}
                                                                                <Button
                                                                                    disabled={isLoading}
                                                                                    type="submit"
                                                                                    size="sm"
                                                                                    className=""
                                                                                >
                                                                                    {isLoading && (
                                                                                        <Loader2 className=" h-4 w-4 animate-spin" />
                                                                                    )}
                                                                                    {isLoading ? "Updating" : "Update"}
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </form>
                                                </Form>
                                            </div>

                                        )}

                                    <div className="mt-2">
                                        {(user?._id === comment?.commentedBy?._id || user?.role === UserRoles.ADMIN) && !isEditOpen && (
                                            <div className="flex space-x-4 text-sm text-gray-600">
                                                <button className="hover:underline" onClick={() => handleEdit(comment?._id)}>Edit</button>
                                                <button className="hover:underline" onClick={() => handleDelete(comment?._id)}>Delete</button>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='flex flex-col gap-2 mb-2'>
                        <Skeleton className="h-[80px] bg-gray-200 w-full rounded-xl" />
                        <Skeleton className="h-[80px] bg-gray-200 w-full rounded-xl" />
                        <Skeleton className="h-[80px] bg-gray-200 w-full rounded-xl" />
                    </div>
                )}
            </div>
        </>
    )
}

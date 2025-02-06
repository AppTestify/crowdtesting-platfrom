import { IComment } from '@/app/_interface/comment';
import { addCommentService, deleteCommentService, getCommentsService, updateCommentService, verifyCommentService } from '@/app/_services/comment.service';
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
import TextEditor from '../../_components/text-editor';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { UserRoles } from '@/app/_constants/user-roles';
import { Check, CircleAlert, Loader2 } from 'lucide-react';
import { ConfirmationDialog } from '@/app/_components/confirmation-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { getProfilePictureService } from '@/app/_services/user.service';
import { PAGINATION_LIMIT } from '@/app/_constants/pagination-limit';
import { Separator } from '@/components/ui/separator';
import { checkProjectAdmin } from '@/app/_utils/common';
import { IProject } from '@/app/_interface/project';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const commentSchema = z.object({
    entityId: z.string().min(1, "Required"),
    content: z.string().min(1, "Required"),
});

export default function DefaultComments({ project, entityId, entityName }: { project: IProject, entityId: string, entityName: string }) {
    const { projectId } = useParams<{ projectId: string }>();
    const [comments, setComments] = useState<IComment[]>([]);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [user, setUser] = useState<any | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [isVerifyOpen, setIsVerifyOpen] = useState<boolean>(false);
    const [commentId, setCommentId] = useState<string>("");
    const [isVerifyLoading, setIsVerifyLoading] = useState<boolean>(false);
    const [isVerify, setIsVerify] = useState<boolean>(false);
    const [profile, setProfile] = useState<any>();
    const [pageSize, setPageSize] = useState(PAGINATION_LIMIT);
    const [totalComments, setTotalComments] = useState<number>(0);
    const checkProjectRole = checkProjectAdmin(project as IProject, user);
    const { data } = useSession();

    const form = useForm<z.infer<typeof commentSchema>>({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            entityId: entityId,
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
            entityId: entityId,
            content: "",
        },
    });

    const formatEntityName = (entityName: string) => {
        return entityName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    // Update the edit form when commentId or comments change
    useEffect(() => {
        if (commentId) {
            const currentComment = comments.find((comment) => comment._id === commentId);
            if (currentComment) {
                editForm.reset({
                    entityId: entityId,
                    content: currentComment.content || "",
                });
            }
        }
    }, [commentId, comments]);

    async function onSubmit(values: z.infer<typeof commentSchema>) {
        setIsLoading(true);
        try {
            const response = await addCommentService(projectId, formatEntityName(entityName), entityId, {
                ...values,
                isVerify: user?.role === UserRoles.TESTER ? false : true,
                entityType: entityName
            });
            if (response) {
                reset();
                getComments();
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
            const response = await updateCommentService(commentId, projectId, formatEntityName(entityName), entityId, values);
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
            const response = await getCommentsService(projectId, formatEntityName(entityName), entityId, pageSize);
            setComments(response?.comments);
            setTotalComments(response?.total);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
    }

    const getProfile = async () => {
        try {
            const response = await getProfilePictureService();
            if (response) {
                setProfile(response);
            }
        } catch (error) {
            toasterService.error();
        }
    }

    const deleteComment = async () => {
        setIsDeleteLoading(true);
        try {
            const response = await deleteCommentService(projectId, formatEntityName(entityName), entityId, commentId);
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

    const verifyComment = async () => {
        setIsVerifyLoading(true);
        try {
            const response = await verifyCommentService(commentId, projectId, formatEntityName(entityName), entityId, { isVerify: isVerify ? false : true });
            if (response) {
                getComments();
                setIsVerifyOpen(false);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsVerifyLoading(false);
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
    }, [projectId, entityId, pageSize]);

    useEffect(() => {
        getProfile();
    }, []);

    useEffect(() => {
        if (isEdit) {
            form.reset();
        }
    }, [isEdit]);

    const handleDelete = (id: string) => {
        setIsDeleteOpen(true);
        setCommentId(id);
    }

    const handleEdit = (id: string) => {
        setIsEditOpen(true);
        setCommentId(id);
    }

    const handleVerify = (id: string, isVerify: boolean) => {
        setIsVerifyOpen(true);
        setCommentId(id);
        setIsVerify(isVerify);
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

            <ConfirmationDialog
                isOpen={isVerifyOpen}
                setIsOpen={setIsVerifyOpen}
                title={`${isVerify ? "Unverify" : "Verify"} comment`}
                description={`Are you sure you want to ${isVerify ? "unVerify" : "verify"} this comment?`}
                isLoading={isVerifyLoading}
                successAction={verifyComment}
                successLabel={`${isVerify ? "Unverify" : "Verify"}`}
                successLoadingLabel={`${isVerify ? "Unverifing" : "Verifing"}`}
                successVariant={"default"}
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
                                                        src={getFormattedBase64ForSrc(profile)}
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
                                                        onClick={() => setIsEdit(true)}
                                                        readOnly={true}
                                                    />
                                                ) : (
                                                    <div className="w-[90%] sm:w-full ml-3 pr-2">
                                                        <TextEditor
                                                            markup={field.value || ""}
                                                            placeholder={"Type your comment here..."}
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
                                            </div >
                                        </FormControl >
                                        <FormMessage />
                                    </FormItem >
                                )
                                }
                            />
                        </form >
                    </Form >
                </div >
                {!isViewLoading ? (
                    <div className="mt-5">
                        {comments?.map((comment, index) => (
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
                                        <span className="text-sm font-semibold text-gray-700 flex items-center">
                                            {/* For client cannot see user name */}
                                            {user?.role === UserRoles.CLIENT ?
                                                user?._id === comment?.commentedBy?._id ?
                                                    `${comment?.commentedBy?.firstName || ""} ${comment?.commentedBy?.lastName || ""}` : comment?.commentedBy?.customId
                                                : `${comment?.commentedBy?.firstName || ""} ${comment?.commentedBy?.lastName || ""}`
                                            }
                                            {user?.role === UserRoles.ADMIN &&
                                                <>
                                                    <TooltipProvider delayDuration={10}>
                                                        {comment?.isVerify ? (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="ml-2 xs:ml-4 bg-primary border border-primary text-white rounded-full p-1 flex items-center justify-center w-6 h-6">
                                                                        <Check className="h-5 w-5" />
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent className='px-2 py-1'>
                                                                    <p>Verified</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) :
                                                            (
                                                                <Tooltip>
                                                                    <TooltipTrigger className='bg-destructive' asChild>
                                                                        <span className="ml-2 xs:ml-4 bg-destructive border border-destructive text-white rounded-full p-1 flex items-center justify-center w-6 h-6">
                                                                            <CircleAlert className="h-6 w-6" />
                                                                        </span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className='bg-destructive px-2 py-1'>
                                                                        <p>Unverified</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )
                                                        }
                                                    </TooltipProvider>
                                                </>
                                            }
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(comment?.createdAt || new Date()), { addSuffix: true })}
                                        </span>
                                    </div>

                                    {isEditOpen && commentId === comment?._id ?
                                        (
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
                                                                                placeholder={"Type your comment here..."}
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

                                        ) :
                                        (
                                            <div className="mt-2 text-sm text-gray-800">
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: comment?.content || "",
                                                    }}
                                                />
                                            </div>
                                        )}

                                    <div className="mt-2">
                                        {(user?._id === comment?.commentedBy?._id || user?.role === UserRoles.ADMIN || checkProjectRole) && !isEditOpen && (
                                            <div className="flex space-x-4 text-sm text-gray-600">
                                                <button className="hover:underline" onClick={() => handleEdit(comment?._id)}>Edit</button>
                                                <button className="hover:underline" onClick={() => handleDelete(comment?._id)}>Delete</button>
                                                {user?.role === UserRoles.ADMIN &&
                                                    <button className="hover:underline" onClick={() => handleVerify(comment?._id, comment?.isVerify)}>
                                                        {comment?.isVerify ? 'Unverify' : 'Verify'}
                                                    </button>
                                                }
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        ))}
                        {totalComments > comments.length && (
                            <div>
                                <Separator className="" />
                                <div className='mt-4 text-sm text-gray-800 cursor-pointer' onClick={() => setPageSize(pageSize + PAGINATION_LIMIT)}>
                                    See more comments
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    [...Array(3)].map((_, index) => (
                        <div key={index} className="flex flex-col gap-2 mb-2 w-full">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="bg-gray-200 h-12 w-12 rounded-full" />
                                <div className="flex flex-col space-y-2 w-full">
                                    <Skeleton className="bg-gray-200 h-4 w-full" />
                                    <Skeleton className="bg-gray-200 h-4 w-[80%]" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div >
        </>
    )
}

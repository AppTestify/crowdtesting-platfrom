import { useState, useEffect, useMemo } from "react";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Trash, CheckIcon, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import toasterService from "@/app/_services/toaster-service";
import { getAllUsersService } from "@/app/_services/user.service";
import { IUserByAdmin } from "@/app/_interface/user";
import { Input } from "@/components/ui/input";
import { addMailService } from "@/app/_services/mail.service";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { showUsersRoleInBadges } from "@/app/_utils/common-functionality";
import { UserRoles } from "@/app/_constants/user-roles";

const mailSchema = z.object({
    emails: z.array(z.string()).min(1, "At least one user is required").max(20, "Maximum 20 users allowed"),
    subject: z.string().min(1, "Required"),
    body: z.string().min(1, "Required"),
});

interface MailComposeProps {
    refreshMails: () => void;
}

export function MailCompose({ refreshMails }: MailComposeProps) {
    const form = useForm<z.infer<typeof mailSchema>>({
        resolver: zodResolver(mailSchema),
        defaultValues: {
            emails: [],
            subject: "",
            body: "",
        },
    });

    const [users, setUsers] = useState<IUserByAdmin[]>([]);
    const [searchString, setSearchString] = useState<string>("");
    const userData = form.watch("emails");
    const [itemsPerRow, setItemsPerRow] = useState<number>(3);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 640) {
                setItemsPerRow(1);
            } else if (window.innerWidth <= 1024) {
                setItemsPerRow(2);
            } else {
                setItemsPerRow(3);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const inputHeight = Math.max(40, 30 + Math.ceil(userData?.length / itemsPerRow) * 30);
    const defaultUsers = useMemo(() => users.map((user) => user), [users]);

    const shouldShowAddButton = useMemo(()=> {
        return searchString && !defaultUsers.some(user => user.email.includes(searchString));
    }, [searchString, defaultUsers]);

    const addCustomUser = () => {
        if (!searchString) return;
        form.setValue("emails", [...userData, searchString]);
        setSearchString("");
    };

    const handleSelectUser = (user: string) => {
        if (!userData.includes(user)) {
            form.setValue("emails", [...userData, user]);
        }
        form.clearErrors('emails');
    };

    const handleRemoveUser = (index: number) => {
        form.setValue(
            "emails",
            userData.filter((_, idx) => idx !== index)
        );
    };

    const validateMail = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
        }
    };

    const reset = () => {
        form.reset();
    }

    const onSubmit = async (data: z.infer<typeof mailSchema>) => {
        setIsLoading(true);
        try {
            const response = await addMailService(data);
            if (response) {
                toasterService.success(response.message);
                refreshMails();
                reset();
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userData?.length <= 20) {
            form.clearErrors('emails');
        }
    }, [userData]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsersService();
                setUsers(response);
            } catch (error) {
                toasterService.error();
            }
        };

        fetchUsers();
    }, []);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-4">
                    <FormItem className="flex flex-col gap-2">
                        <FormLabel>Recipients</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        'justify-start items-start p-2 flex-wrap gap-2',
                                        !searchString && 'text-muted-foreground'
                                    )}
                                    style={{
                                        height: `${inputHeight}px`,
                                        minHeight: '40px',
                                        maxHeight: '150px',
                                        overflowY: 'auto',
                                    }}
                                >
                                    {/* User Tags */}
                                    <div className="flex flex-wrap gap-2 overflow-hidden max-w-full">
                                        {userData?.map((user, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 bg-gray-200 px-2 py-1 rounded-full"
                                            >
                                                <span className="text-xs text-black">{user}</span>
                                                <div className="p-1 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveUser(index)
                                                    }}>
                                                    <Trash size={8} className="text-destructive" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {userData?.length === 0 && <span className="text-start">Select Recipients</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-full" side="bottom" align="start" sideOffset={4}>
                                <Command>
                                    <CommandInput
                                        placeholder="Search users"
                                        className="h-9"
                                        value={searchString}
                                        onValueChange={(value: string) => setSearchString(value)}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            <span className="text-sm">No user found</span>
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {shouldShowAddButton && (
                                                <CommandItem value={searchString} onSelect={addCustomUser}>
                                                    {searchString}
                                                </CommandItem>
                                            )}
                                            {defaultUsers
                                                .filter((user) =>
                                                    user.email?.toLowerCase().includes(searchString.toLowerCase())
                                                )
                                                .map((user) => (
                                                    <CommandItem
                                                        key={user.id}
                                                        value={user.email}
                                                        onSelect={() => handleSelectUser(user.email)}
                                                    >
                                                        <div className="flex justify-evenly gap-2">
                                                            {user.customId} - {user.email}{(user?.firstName || user?.lastName) &&
                                                                ` (${user?.firstName || ""} ${user?.lastName || ""})`}
                                                            {showUsersRoleInBadges(user?.role as UserRoles)}
                                                            {user?.tester?.address?.country && (
                                                                <div className="flex items-center justify-center">
                                                                    <MapPin className="mr-1" /> {user.tester.address.country}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <CheckIcon
                                                            className={cn(
                                                                "ml-auto h-4 w-4",
                                                                userData?.includes(user.email) ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {form.formState.errors.emails && (
                            <span className="text-red-500 text-sm">{form.formState.errors.emails.message}</span>
                        )}
                    </FormItem>

                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter email subject" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                    <div className="h-[120px] sm:h-[150px]">
                                        <TextEditor
                                            markup={field.value || ""}
                                            onChange={(value) => {
                                                form.setValue("body", value);
                                                form.trigger("body");
                                            }} 
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                {/* Fixed button container - always visible within card */}
                <div className="flex-shrink-0 border-t bg-background px-6 py-4">
                    <div className="flex justify-end">
                        <Button 
                            type="submit" 
                            disabled={isLoading} 
                            onClick={validateMail}
                            className="min-w-[120px] h-10 bg-green-600 hover:bg-green-700 text-white font-medium shadow-md"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send Email"
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
} 